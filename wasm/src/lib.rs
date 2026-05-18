mod utils;

use wasm_bindgen::prelude::*;
use web_sys::ImageData;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn init() {
    utils::set_panic_hook();
}

#[wasm_bindgen]
pub fn inpaint_image(
    image_data: &mut ImageData,
    marks_x: &[f64],
    marks_y: &[f64],
    marks_width: &[f64],
    marks_height: &[f64],
) -> Result<(), JsValue> {
    let width = image_data.width() as usize;
    let height = image_data.height() as usize;
    let data = image_data.data();

    for i in 0..marks_x.len() {
        let rect = Rect {
            x: marks_x[i] as usize,
            y: marks_y[i] as usize,
            width: marks_width[i] as usize,
            height: marks_height[i] as usize,
        };
        inpaint_region(data, width, height, &rect);
    }

    Ok(())
}

struct Rect {
    x: usize,
    y: usize,
    width: usize,
    height: usize,
}

fn inpaint_region(data: &mut [u8], width: usize, height: usize, rect: &Rect) {
    let start_x = rect.x.max(0);
    let start_y = rect.y.max(0);
    let end_x = (rect.x + rect.width).min(width - 1);
    let end_y = (rect.y + rect.height).min(height - 1);

    let iterations = 12;
    for _iter in 0..iterations {
        let temp_data = data.to_vec();

        for y in start_y..=end_y {
            for x in start_x..=end_x {
                if !is_in_rect(x, y, rect) {
                    continue;
                }

                let neighbors = get_valid_neighbors(x, y, width, height, rect, &temp_data);

                if !neighbors.is_empty() {
                    let idx = (y * width + x) * 4;

                    let mut sum_r = 0.0;
                    let mut sum_g = 0.0;
                    let mut sum_b = 0.0;
                    let mut sum_a = 0.0;
                    let mut weight_sum = 0.0;

                    for (nx, ny) in &neighbors {
                        let n_idx = (ny * width + nx) * 4;
                        let distance = (((x as i32 - *nx as i32).pow(2) + (y as i32 - *ny as i32).pow(2)) as f64).sqrt();
                        let weight = 1.0 / (distance + 0.1);

                        sum_r += temp_data[n_idx] as f64 * weight;
                        sum_g += temp_data[n_idx + 1] as f64 * weight;
                        sum_b += temp_data[n_idx + 2] as f64 * weight;
                        sum_a += temp_data[n_idx + 3] as f64 * weight;
                        weight_sum += weight;
                    }

                    data[idx] = (sum_r / weight_sum) as u8;
                    data[idx + 1] = (sum_g / weight_sum) as u8;
                    data[idx + 2] = (sum_b / weight_sum) as u8;
                    data[idx + 3] = (sum_a / weight_sum) as u8;
                }
            }
        }
    }

    for y in start_y..=end_y {
        for x in start_x..=end_x {
            if !is_in_rect(x, y, rect) {
                continue;
            }

            let idx = (y * width + x) * 4;
            use rand::Rng;
            let mut rng = rand::thread_rng();
            
            let noise_level = 0.02;
            let noise_r = (rng.gen::<f64>() - 0.5) * 255.0 * noise_level;
            let noise_g = (rng.gen::<f64>() - 0.5) * 255.0 * noise_level;
            let noise_b = (rng.gen::<f64>() - 0.5) * 255.0 * noise_level;

            data[idx] = ((data[idx] as f64 + noise_r).max(0.0).min(255.0)) as u8;
            data[idx + 1] = ((data[idx + 1] as f64 + noise_g).max(0.0).min(255.0)) as u8;
            data[idx + 2] = ((data[idx + 2] as f64 + noise_b).max(0.0).min(255.0)) as u8;
        }
    }
}

fn is_in_rect(x: usize, y: usize, rect: &Rect) -> bool {
    x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height
}

fn get_valid_neighbors(
    x: usize,
    y: usize,
    width: usize,
    height: usize,
    rect: &Rect,
    _data: &[u8],
) -> Vec<(usize, usize)> {
    let mut neighbors = Vec::new();
    let radius = 4;

    for dy in -(radius as i32)..=radius as i32 {
        for dx in -(radius as i32)..=radius as i32 {
            if dx == 0 && dy == 0 {
                continue;
            }

            let nx = x as i32 + dx;
            let ny = y as i32 + dy;

            if nx < 0 || nx >= width as i32 || ny < 0 || ny >= height as i32 {
                continue;
            }

            let nx_usize = nx as usize;
            let ny_usize = ny as usize;

            if is_in_rect(nx_usize, ny_usize, rect) {
                continue;
            }

            neighbors.push((nx_usize, ny_usize));
        }
    }

    neighbors
}
