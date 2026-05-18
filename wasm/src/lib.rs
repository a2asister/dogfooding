use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

const MAX_PIXELS: usize = 1600 * 1600;

#[wasm_bindgen]
pub fn alloc(size: usize) -> *mut u8 {
    let mut buf = Vec::with_capacity(size);
    let ptr = buf.as_mut_ptr();
    std::mem::forget(buf);
    ptr
}

#[wasm_bindgen]
pub fn dealloc(ptr: *mut u8, size: usize) {
    unsafe {
        let _ = Vec::from_raw_parts(ptr, 0, size);
    }
}

fn clamp(v: i32) -> u8 {
    v.max(0).min(255) as u8
}

fn get_pixel(data: &[u8], width: usize, x: usize, y: usize) -> (u8, u8, u8, u8) {
    let idx = (y * width + x) * 4;
    (
        data[idx],
        data[idx + 1],
        data[idx + 2],
        data[idx + 3],
    )
}

fn quick_select(arr: &mut [u8], k: usize) -> u8 {
    if arr.len() == 1 {
        return arr[0];
    }
    let pivot_idx = arr.len() / 2;
    let pivot = arr[pivot_idx];
    let mut left = Vec::new();
    let mut right = Vec::new();
    let mut equal = Vec::new();

    for &v in arr.iter() {
        if v < pivot {
            left.push(v);
        } else if v > pivot {
            right.push(v);
        } else {
            equal.push(v);
        }
    }

    if k < left.len() {
        quick_select(&mut left, k)
    } else if k < left.len() + equal.len() {
        pivot
    } else {
        quick_select(&mut right, k - left.len() - equal.len())
    }
}

fn median_filter(
    input: &[u8],
    width: usize,
    height: usize,
    radius: usize,
) -> Vec<u8> {
    let mut output = vec![0u8; input.len()];
    let window_size = (2 * radius + 1) * (2 * radius + 1);
    let mid_index = window_size / 2;

    for y in 0..height {
        for x in 0..width {
            let idx = (y * width + x) * 4;
            let mut r_vals = Vec::with_capacity(window_size);
            let mut g_vals = Vec::with_capacity(window_size);
            let mut b_vals = Vec::with_capacity(window_size);

            for dy in -(radius as i32)..=(radius as i32) {
                for dx in -(radius as i32)..=(radius as i32) {
                    let nx = (x as i32 + dx).max(0).min((width - 1) as i32) as usize;
                    let ny = (y as i32 + dy).max(0).min((height - 1) as i32) as usize;
                    let (r, g, b, _) = get_pixel(input, width, nx, ny);
                    r_vals.push(r);
                    g_vals.push(g);
                    b_vals.push(b);
                }
            }

            output[idx] = quick_select(&mut r_vals, mid_index);
            output[idx + 1] = quick_select(&mut g_vals, mid_index);
            output[idx + 2] = quick_select(&mut b_vals, mid_index);
            output[idx + 3] = input[idx + 3];
        }
    }
    output
}

fn gaussian_blur(
    input: &[u8],
    width: usize,
    height: usize,
    sigma: f32,
) -> Vec<u8> {
    let mut output = vec![0u8; input.len()];
    let radius = (sigma * 3.0).ceil() as usize;
    let kernel_size = 2 * radius + 1;
    let mut kernel = vec![0.0f32; kernel_size * kernel_size];
    let mut sum = 0.0f32;

    for i in 0..kernel_size {
        for j in 0..kernel_size {
            let x = (i as i32 - radius as i32) as f32;
            let y = (j as i32 - radius as i32) as f32;
            let val = (-(x * x + y * y) / (2.0 * sigma * sigma)).exp();
            kernel[i * kernel_size + j] = val;
            sum += val;
        }
    }

    for k in &mut kernel {
        *k /= sum;
    }

    for y in 0..height {
        for x in 0..width {
            let idx = (y * width + x) * 4;
            let mut r = 0.0f32;
            let mut g = 0.0f32;
            let mut b = 0.0f32;
            let mut ki = 0;

            for dy in 0..kernel_size {
                for dx in 0..kernel_size {
                    let nx = (x as i32 + dx as i32 - radius as i32)
                        .max(0)
                        .min((width - 1) as i32) as usize;
                    let ny = (y as i32 + dy as i32 - radius as i32)
                        .max(0)
                        .min((height - 1) as i32) as usize;
                    let (pr, pg, pb, _) = get_pixel(input, width, nx, ny);
                    let k = kernel[ki];
                    r += pr as f32 * k;
                    g += pg as f32 * k;
                    b += pb as f32 * k;
                    ki += 1;
                }
            }

            output[idx] = clamp(r.round() as i32);
            output[idx + 1] = clamp(g.round() as i32);
            output[idx + 2] = clamp(b.round() as i32);
            output[idx + 3] = input[idx + 3];
        }
    }
    output
}

fn unsharp_mask(
    input: &[u8],
    width: usize,
    height: usize,
    amount: f32,
    sigma: f32,
) -> Vec<u8> {
    let blurred = gaussian_blur(input, width, height, sigma);
    let mut output = vec![0u8; input.len()];

    for i in (0..input.len()).step_by(4) {
        for c in 0..3 {
            let original = input[i + c] as f32;
            let blur = blurred[i + c] as f32;
            let high_freq = original - blur;
            output[i + c] = clamp((original + high_freq * amount).round() as i32);
        }
        output[i + 3] = input[i + 3];
    }
    output
}

fn sobel_edge(
    data: &[u8],
    width: usize,
    height: usize,
    x: usize,
    y: usize,
) -> f32 {
    if x == 0 || x >= width - 1 || y == 0 || y >= height - 1 {
        return 0.0;
    }

    let get_gray = |dx: i32, dy: i32| -> f32 {
        let nx = (x as i32 + dx) as usize;
        let ny = (y as i32 + dy) as usize;
        let (r, g, b, _) = get_pixel(data, width, nx, ny);
        r as f32 * 0.299 + g as f32 * 0.587 + b as f32 * 0.114
    };

    let gx = -get_gray(-1, -1) - 2.0 * get_gray(-1, 0) - get_gray(-1, 1)
        + get_gray(1, -1) + 2.0 * get_gray(1, 0) + get_gray(1, 1);

    let gy = -get_gray(-1, -1) - 2.0 * get_gray(0, -1) - get_gray(1, -1)
        + get_gray(-1, 1) + 2.0 * get_gray(0, 1) + get_gray(1, 1);

    (gx * gx + gy * gy).sqrt() / 255.0
}

fn analyze_brightness(
    data: &[u8],
    width: usize,
    height: usize,
) -> (bool, bool) {
    let mut top_sum = 0.0f32;
    let mut bottom_sum = 0.0f32;
    let mut top_count = 0usize;
    let mut bottom_count = 0usize;

    let top_height = (height as f32 * 0.3) as usize;
    let bottom_start = (height as f32 * 0.7) as usize;

    for y in 0..height {
        for x in 0..width {
            let (r, g, b, _) = get_pixel(data, width, x, y);
            let gray = r as f32 * 0.299 + g as f32 * 0.587 + b as f32 * 0.114;

            if y < top_height {
                top_sum += gray;
                top_count += 1;
            } else if y >= bottom_start {
                bottom_sum += gray;
                bottom_count += 1;
            }
        }
    }

    let avg_top = if top_count > 0 { top_sum / top_count as f32 } else { 128.0 };
    let avg_bottom = if bottom_count > 0 { bottom_sum / bottom_count as f32 } else { 128.0 };

    let has_sky = avg_top > 150.0 && avg_top - avg_bottom > 20.0;
    let has_ground = avg_bottom < 100.0 && avg_top - avg_bottom > 20.0;

    (has_sky, has_ground)
}

fn get_semantic_color(
    x: usize,
    y: usize,
    width: usize,
    height: usize,
    gray: f32,
    edge: f32,
    has_sky: bool,
    has_ground: bool,
) -> (u8, u8, u8) {
    let nx = x as f32 / width as f32;
    let ny = y as f32 / height as f32;

    if has_sky && ny < 0.25 {
        if gray > 180.0 {
            return (135, 206, 235);
        } else if gray > 150.0 {
            return (176, 224, 230);
        } else {
            return (100, 149, 237);
        }
    }

    if has_ground && ny > 0.75 {
        if gray < 60.0 {
            return (101, 67, 33);
        } else if gray < 100.0 {
            return (139, 119, 101);
        } else {
            return (210, 180, 140);
        }
    }

    if ny > 0.3 && ny < 0.7 {
        if edge > 0.3 {
            if nx < 0.5 {
                return (34, 139, 34);
            } else {
                return (255, 140, 0);
            }
        }

        if gray < 80.0 {
            if nx < 0.3 {
                return (85, 107, 47);
            } else if nx < 0.7 {
                return (139, 90, 43);
            } else {
                return (178, 34, 34);
            }
        } else if gray < 150.0 {
            if nx < 0.5 {
                return (144, 238, 144);
            } else {
                return (255, 215, 0);
            }
        } else {
            return (245, 245, 220);
        }
    }

    if gray < 60.0 {
        (101, 67, 33)
    } else if gray < 100.0 {
        (139, 115, 85)
    } else if gray < 150.0 {
        (210, 180, 140)
    } else if gray < 200.0 {
        (245, 222, 179)
    } else {
        (255, 250, 240)
    }
}

#[wasm_bindgen]
pub fn denoise(
    input_ptr: *mut u8,
    output_ptr: *mut u8,
    width: usize,
    height: usize,
    strength: f32,
) {
    if width * height > MAX_PIXELS {
        return;
    }

    let size = width * height * 4;
    let input = unsafe { std::slice::from_raw_parts(input_ptr, size) };
    let output = unsafe { std::slice::from_raw_parts_mut(output_ptr, size) };

    let radius = ((strength * 2.0).max(1.0).round() as usize).max(1);
    let filtered = median_filter(input, width, height, radius);
    output.copy_from_slice(&filtered);
}

#[wasm_bindgen]
pub fn texture_restore(
    input_ptr: *mut u8,
    output_ptr: *mut u8,
    width: usize,
    height: usize,
    enhance: f32,
) {
    if width * height > MAX_PIXELS {
        return;
    }

    let size = width * height * 4;
    let input = unsafe { std::slice::from_raw_parts(input_ptr, size) };
    let output = unsafe { std::slice::from_raw_parts_mut(output_ptr, size) };

    let amount = 0.5 + enhance * 1.5;
    let sigma = 0.8 + enhance * 0.5;
    let sharpened = unsharp_mask(input, width, height, amount, sigma);
    output.copy_from_slice(&sharpened);
}

#[wasm_bindgen]
pub fn colorize(
    input_ptr: *mut u8,
    output_ptr: *mut u8,
    width: usize,
    height: usize,
    intensity: f32,
) {
    if width * height > MAX_PIXELS {
        return;
    }

    let size = width * height * 4;
    let input = unsafe { std::slice::from_raw_parts(input_ptr, size) };
    let output = unsafe { std::slice::from_raw_parts_mut(output_ptr, size) };

    let (has_sky, has_ground) = analyze_brightness(input, width, height);
    let edge_strength = 1.2;

    for y in 0..height {
        for x in 0..width {
            let idx = (y * width + x) * 4;
            let r = input[idx] as f32;
            let g = input[idx + 1] as f32;
            let b = input[idx + 2] as f32;
            let a = input[idx + 3];

            let gray = r * 0.299 + g * 0.587 + b * 0.114;
            let edge = sobel_edge(input, width, height, x, y);

            let (sr, sg, sb) = get_semantic_color(x, y, width, height, gray, edge, has_sky, has_ground);

            let edge_boost = 1.0 + edge * edge_strength;
            let final_r = clamp((sr as f32 * edge_boost).round() as i32);
            let final_g = clamp((sg as f32 * edge_boost).round() as i32);
            let final_b = clamp((sb as f32 * edge_boost).round() as i32);

            let mixed_r = gray * (1.0 - intensity) + final_r as f32 * intensity;
            let mixed_g = gray * (1.0 - intensity) + final_g as f32 * intensity;
            let mixed_b = gray * (1.0 - intensity) + final_b as f32 * intensity;

            output[idx] = clamp(mixed_r.round() as i32);
            output[idx + 1] = clamp(mixed_g.round() as i32);
            output[idx + 2] = clamp(mixed_b.round() as i32);
            output[idx + 3] = a;
        }
    }
}
