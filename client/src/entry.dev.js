import { jsx as _jsx } from "@builder.io/qwik/jsx-runtime";
import { render } from '@builder.io/qwik';
import Root from './root';
export default function (opts) {
    return render(document, _jsx(Root, {}), opts);
}
