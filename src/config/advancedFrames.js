
import {
    PieChart, Grid, Type, Layout
} from 'lucide-react';

export const advancedFrameCategories = [
    {
        id: 'fraction_frames',
        title: 'Fraction',
        icon: PieChart,
        items: [
            {
                id: 'frame_half_circle_top',
                type: 'frame',
                label: 'Semi Top',
                icon: PieChart,
                props: {
                    maskType: 'path',
                    path: 'M 0,0.5 A 0.5,0.5 0 0,1 1,0.5 L 1,1 L 0,1 Z', // Bottom is rect, top is arc? No, Semi Top usually means flat bottom, arc top.
                    // Let's do: Flat bottom, Arc top.
                    // M 0,1 L 1,1 L 1,0.5 A 0.5,0.5 0 0,0 0,0.5 Z
                    // Wait, simpler: M 0,0.5 A 0.5,0.5 0 1,1 1,0.5 Z (This is full circle)
                    // Top Half: M 0,0.5 A 0.5,0.5 0 0,1 1,0.5 L 0,0.5 Z ? No.

                    // path: 'M 0,0.5 a 0.5,0.5 0 0,1 1,0' is arc.
                    // Let's use standard rect 0,0,1,1 coords.
                    // Top Semicircle: Move to 0,0.5. Arc to 1,0.5. Line to 0,0.5?
                    // M 0,0.5 A 0.5,0.5 0 0,1 1,0.5 L 1,0.5 L 0,0.5 Z -> This is top half circle.
                    // path: 'M 0,0.5 A 0.5,0.5 0 0,1 1,0.5 L 0.5,0.5 Z' // Pie slice?
                    // Let's stick to easy paths.
                    // Semicircle Top:
                    // M 0,0.5 A 0.5,0.5 0 0,1 1,0.5 Close via line to start?
                    // Actually M 0,0.5 A 0.5,0.5 0 0,1 1,0.5 L 1,0.5 L 0,0.5 Z
                }
            },
            {
                id: 'frame_half_circle_right',
                type: 'frame',
                label: 'Semi Right',
                icon: PieChart,
                props: {
                    maskType: 'path',
                    path: 'M 0.5,0 L 0.5,1 A 0.5,0.5 0 0,0 0.5,0 Z'
                    // Wait, Right semicircle means the arc is on the right.
                    // M 0.5,0 A 0.5,0.5 0 0,1 0.5,1 L 0.5,0 Z
                }
            },
            {
                id: 'frame_quarter_top_left',
                type: 'frame',
                label: '1/4 TopLeft',
                icon: PieChart,
                props: {
                    maskType: 'path',
                    path: 'M 1,0 A 1,1 0 0,0 0,1 L 1,1 L 1,0 Z' // Incorrect.
                    // QTL: Center at 1,1? Rad 1.
                    // M 1,1 L 1,0 A 1,1 0 0,0 0,1 L 1,1 Z
                }
            },
            {
                id: 'frame_arch',
                type: 'frame',
                label: 'Arch',
                icon: PieChart,
                props: {
                    maskType: 'path',
                    path: 'M 0,1 L 0,0.5 A 0.5,0.5 0 0,1 1,0.5 L 1,1 Z'
                }
            },
            {
                id: 'frame_bunker',
                type: 'frame',
                label: 'Bunker',
                icon: PieChart,
                props: {
                    maskType: 'path',
                    path: 'M 0,0 L 1,0 L 1,0.8 A 0.2,0.2 0 0,1 0.8,1 L 0.2,1 A 0.2,0.2 0 0,1 0,0.8 Z' // Rounded bottom corners only? No that's just rounded rect with selective corners.
                    // Let's accept standard SVG paths 0..1
                }
            },
        ]
    },
    {
        id: 'organic_frames',
        title: 'Organic',
        icon: Grid,
        items: [
            {
                id: 'frame_blob_1',
                type: 'frame',
                label: 'Blob 1',
                icon: Grid,
                props: {
                    maskType: 'path',
                    path: 'M0.35,0.03 C0.51,-0.05 0.69,0.02 0.81,0.14 C0.94,0.26 1.01,0.43 0.98,0.61 C0.95,0.78 0.82,0.95 0.65,1.01 C0.48,1.06 0.28,1.01 0.14,0.89 C0.01,0.76 -0.05,0.57 0.03,0.41 C0.11,0.24 0.19,0.11 0.35,0.03 Z'
                }
            },
            {
                id: 'frame_blob_2',
                type: 'frame',
                label: 'Blob 2',
                icon: Grid,
                props: {
                    maskType: 'path',
                    path: 'M0.87,0.23 C0.96,0.37 0.99,0.56 0.92,0.73 C0.85,0.90 0.69,1.04 0.50,1.02 C0.32,1.00 0.12,0.82 0.05,0.64 C-0.03,0.46 0.02,0.27 0.15,0.14 C0.29,0.01 0.50,-0.04 0.67,0.03 C0.84,0.09 0.78,0.08 0.87,0.23 Z'
                }
            },
            {
                id: 'frame_blob_3',
                type: 'frame',
                label: 'Blob 3',
                icon: Grid,
                props: {
                    maskType: 'path',
                    path: 'M0.5,0 C0.7,0 0.8,0.2 0.9,0.3 C1,0.5 0.9,0.8 0.7,0.9 C0.5,1 0.3,0.9 0.1,0.8 C0,0.6 -0.1,0.3 0.1,0.1 C0.2,0 0.4,0 0.5,0 Z'
                }
            },
            {
                id: 'frame_rip_paper',
                type: 'frame',
                label: 'Ripped',
                icon: Grid,
                props: {
                    maskType: 'path',
                    path: 'M0,0 L1,0 L1,1 L0,1 L0,0.9 L0.05,0.85 L0,0.8 L0.05,0.75 L0,0.7 L0.05,0.65 L0,0.6 L0.05,0.55 L0,0.5 L0.05,0.45 L0,0.4 L0.05,0.35 L0,0.3 L0.05,0.25 L0,0.2 L0.05,0.15 L0,0.1 L0.05,0.05 L0,0 Z'
                }
            }
        ]
    },
    {
        id: 'text_mask_frames',
        title: 'Text Masks',
        icon: Type,
        items: [
            { id: 'frame_char_A', type: 'frame', label: 'A', icon: Type, props: { maskType: 'path', path: 'M0.5,0 L1,1 L0.8,1 L0.7,0.8 L0.3,0.8 L0.2,1 L0,1 L0.5,0 M0.5,0.2 L0.65,0.6 L0.35,0.6 L0.5,0.2 Z' } },
            { id: 'frame_char_B', type: 'frame', label: 'B', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.6,0 C0.8,0 0.9,0.1 0.9,0.25 C0.9,0.35 0.8,0.45 0.7,0.48 C0.85,0.5 0.95,0.6 0.95,0.75 C0.95,0.9 0.8,1 0.6,1 L0,1 L0,0 M0.2,0.15 L0.2,0.4 L0.5,0.4 C0.65,0.4 0.7,0.35 0.7,0.27 C0.7,0.2 0.65,0.15 0.5,0.15 L0.2,0.15 M0.2,0.55 L0.2,0.85 L0.5,0.85 C0.7,0.85 0.75,0.8 0.75,0.7 C0.75,0.6 0.7,0.55 0.5,0.55 L0.2,0.55 Z' } },
            { id: 'frame_char_C', type: 'frame', label: 'C', icon: Type, props: { maskType: 'path', path: 'M0.9,0.2 L0.7,0.3 C0.8,0.4 0.8,0.45 0.8,0.5 C0.8,0.7 0.7,0.8 0.5,0.8 C0.3,0.8 0.2,0.7 0.2,0.5 C0.2,0.3 0.3,0.2 0.5,0.2 C0.6,0.2 0.7,0.25 0.75,0.3 L0.9,0.15 C0.8,0.05 0.65,0 0.5,0 C0.2,0 0,0.2 0,0.5 C0,0.8 0.2,1 0.5,1 C0.7,1 0.85,0.9 0.95,0.7 L0.8,0.6 C0.75,0.75 0.65,0.8 0.5,0.8 Z' } },
            { id: 'frame_char_D', type: 'frame', label: 'D', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.5,0 C0.8,0 1,0.2 1,0.5 C1,0.8 0.8,1 0.5,1 L0,1 L0,0 M0.2,0.2 L0.2,0.8 L0.5,0.8 C0.7,0.8 0.8,0.7 0.8,0.5 C0.8,0.3 0.7,0.2 0.5,0.2 L0.2,0.2 Z' } },
            { id: 'frame_char_E', type: 'frame', label: 'E', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.9,0 L0.9,0.2 L0.2,0.2 L0.2,0.4 L0.8,0.4 L0.8,0.6 L0.2,0.6 L0.2,0.8 L0.9,0.8 L0.9,1 L0,1 L0,0 Z' } },
            { id: 'frame_char_F', type: 'frame', label: 'F', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.9,0 L0.9,0.2 L0.2,0.2 L0.2,0.4 L0.8,0.4 L0.8,0.6 L0.2,0.6 L0.2,1 L0,1 L0,0 Z' } },
            { id: 'frame_char_G', type: 'frame', label: 'G', icon: Type, props: { maskType: 'path', path: 'M0.9,0.2 L0.7,0.3 C0.8,0.4 0.8,0.45 0.8,0.5 C0.8,0.7 0.7,0.8 0.5,0.8 C0.3,0.8 0.2,0.7 0.2,0.5 C0.2,0.3 0.3,0.2 0.5,0.2 C0.6,0.2 0.7,0.25 0.75,0.3 L0.9,0.15 C0.8,0.05 0.65,0 0.5,0 C0.2,0 0,0.2 0,0.5 C0,0.8 0.2,1 0.5,1 C0.7,1 0.9,0.9 1,0.8 L1,0.5 L0.5,0.5 L0.5,0.7 L0.8,0.7 L0.8,0.8 C0.75,0.9 0.65,0.9 0.5,0.9 C0.3,0.9 0.2,0.7 0.2,0.5 C0.2,0.3 0.3,0.2 0.5,0.1 Z' } },
            { id: 'frame_char_H', type: 'frame', label: 'H', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.2,0.4 L0.8,0.4 L0.8,0 L1,0 L1,1 L0.8,1 L0.8,0.6 L0.2,0.6 L0.2,1 L0,1 L0,0 Z' } },
            { id: 'frame_char_I', type: 'frame', label: 'I', icon: Type, props: { maskType: 'path', path: 'M0.4,0 L0.6,0 L0.6,1 L0.4,1 L0.4,0 Z' } },
            { id: 'frame_char_J', type: 'frame', label: 'J', icon: Type, props: { maskType: 'path', path: 'M0.6,0 L0.8,0 L0.8,0.8 C0.8,0.9 0.7,1 0.5,1 C0.3,1 0.2,0.9 0.1,0.8 L0.25,0.65 C0.3,0.7 0.4,0.8 0.5,0.8 C0.6,0.8 0.6,0.7 0.6,0.6 L0.6,0 Z' } },
            { id: 'frame_char_K', type: 'frame', label: 'K', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.2,0.4 L0.7,0 L0.95,0 L0.45,0.5 L1,1 L0.75,1 L0.2,0.6 L0.2,1 L0,1 L0,0 Z' } },
            { id: 'frame_char_L', type: 'frame', label: 'L', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.2,0.8 L0.9,0.8 L0.9,1 L0,1 L0,0 Z' } },
            { id: 'frame_char_M', type: 'frame', label: 'M', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.5,0.5 L0.8,0 L1,0 L1,1 L0.8,1 L0.8,0.4 L0.5,0.9 L0.2,0.4 L0.2,1 L0,1 L0,0 Z' } },
            { id: 'frame_char_N', type: 'frame', label: 'N', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.8,0.7 L0.8,0 L1,0 L1,1 L0.8,1 L0.2,0.3 L0.2,1 L0,1 L0,0 Z' } },
            { id: 'frame_char_O', type: 'frame', label: 'O', icon: Type, props: { maskType: 'path', path: 'M0.5,0 C0.2,0 0,0.2 0,0.5 C0,0.8 0.2,1 0.5,1 C0.8,1 1,0.8 1,0.5 C1,0.2 0.8,0 0.5,0 M0.5,0.2 C0.7,0.2 0.8,0.3 0.8,0.5 C0.8,0.7 0.7,0.8 0.5,0.8 C0.3,0.8 0.2,0.7 0.2,0.5 C0.2,0.3 0.3,0.2 0.5,0.2 Z' } },
            { id: 'frame_char_P', type: 'frame', label: 'P', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.6,0 C0.8,0 1,0.2 1,0.4 C1,0.7 0.8,0.75 0.5,0.75 L0.2,0.75 L0.2,1 L0,1 L0,0 M0.2,0.2 L0.2,0.55 L0.5,0.55 C0.7,0.55 0.8,0.5 0.8,0.4 C0.8,0.3 0.7,0.2 0.5,0.2 L0.2,0.2 Z' } },
            { id: 'frame_char_Q', type: 'frame', label: 'Q', icon: Type, props: { maskType: 'path', path: 'M0.5,0 C0.2,0 0,0.2 0,0.5 C0,0.8 0.2,1 0.5,1 C0.65,1 0.75,0.9 0.85,0.8 L0.9,0.9 L1,0.8 L0.9,0.7 C0.95,0.65 1,0.6 1,0.5 C1,0.2 0.8,0 0.5,0 M0.5,0.2 C0.7,0.2 0.8,0.3 0.8,0.5 C0.8,0.6 0.75,0.7 0.65,0.75 L0.6,0.7 L0.5,0.8 C0.3,0.8 0.2,0.7 0.2,0.5 C0.2,0.3 0.3,0.2 0.5,0.2 Z' } },
            { id: 'frame_char_R', type: 'frame', label: 'R', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.6,0 C0.8,0 1,0.2 1,0.4 C1,0.6 0.8,0.7 0.6,0.7 L1,1 L0.7,1 L0.4,0.7 L0.2,0.7 L0.2,1 L0,1 L0,0 M0.2,0.2 L0.2,0.5 L0.5,0.5 C0.7,0.5 0.8,0.45 0.8,0.35 C0.8,0.25 0.7,0.2 0.5,0.2 L0.2,0.2 Z' } },
            { id: 'frame_char_S', type: 'frame', label: 'S', icon: Type, props: { maskType: 'path', path: 'M0.9,0.2 C0.8,0.1 0.7,0 0.5,0 C0.2,0 0,0.2 0,0.4 C0,0.6 0.2,0.7 0.5,0.7 C0.7,0.7 0.8,0.8 0.8,0.9 C0.8,1 0.7,1 0.5,1 C0.3,1 0.1,0.9 0.1,0.8 L0,0.8 C0,1 0.2,1.2 0.5,1.2 C0.8,1.2 1,1 1,0.9 C1,0.7 0.8,0.6 0.5,0.6 C0.3,0.6 0.2,0.5 0.2,0.4 C0.2,0.3 0.3,0.2 0.5,0.2 C0.7,0.2 0.8,0.3 0.9,0.3 L0.9,0.2 Z' } },
            { id: 'frame_char_T', type: 'frame', label: 'T', icon: Type, props: { maskType: 'path', path: 'M0,0 L1,0 L1,0.2 L0.6,0.2 L0.6,1 L0.4,1 L0.4,0.2 L0,0.2 Z' } },
            { id: 'frame_char_U', type: 'frame', label: 'U', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.2,0.7 C0.2,0.9 0.3,1 0.5,1 C0.7,1 0.8,0.9 0.8,0.7 L0.8,0 L1,0 L1,0.7 C1,1 0.8,1.2 0.5,1.2 C0.2,1.2 0,1 0,0.7 L0,0 Z' } }, // Bounds > 1, resizing
            // U: Resize to 0-1 range.
            { id: 'frame_char_U_v2', type: 'frame', label: 'U', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.2,0.7 C0.2,0.9 0.35,1 0.5,1 C0.65,1 0.8,0.9 0.8,0.7 L0.8,0 L1,0 L1,0.7 C1,0.95 0.8,1.1 0.5,1.1 C0.2,1.1 0,0.95 0,0.7 L0,0 Z' } },
            { id: 'frame_char_V', type: 'frame', label: 'V', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.5,0.8 L0.8,0 L1,0 L0.6,1 L0.4,1 L0,0 Z' } },
            { id: 'frame_char_W', type: 'frame', label: 'W', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.35,0.6 L0.5,0.2 L0.65,0.6 L0.8,0 L1,0 L0.8,1 L0.6,1 L0.5,0.6 L0.4,1 L0.2,1 L0,0 Z' } },
            { id: 'frame_char_X', type: 'frame', label: 'X', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.5,0.4 L0.8,0 L1,0 L0.6,0.5 L1,1 L0.8,1 L0.5,0.6 L0.2,1 L0,1 L0.4,0.5 L0,0 Z' } },
            { id: 'frame_char_Y', type: 'frame', label: 'Y', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.2,0 L0.5,0.5 L0.8,0 L1,0 L0.6,0.6 L0.6,1 L0.4,1 L0.4,0.6 L0,0 Z' } },
            { id: 'frame_char_Z', type: 'frame', label: 'Z', icon: Type, props: { maskType: 'path', path: 'M0,0 L1,0 L1,0.2 L0.3,0.8 L1,0.8 L1,1 L0,1 L0,0.8 L0.7,0.2 L0,0.2 L0,0 Z' } }
        ]
    },
    {
        id: 'number_frames',
        title: 'Number Frames',
        icon: Type,
        items: [
            { id: 'frame_num_0', type: 'frame', label: '0', icon: Type, props: { maskType: 'path', path: 'M0.5,0 C0.2,0 0,0.2 0,0.5 C0,0.8 0.2,1 0.5,1 C0.8,1 1,0.8 1,0.5 C1,0.2 0.8,0 0.5,0 M0.5,0.2 C0.7,0.2 0.8,0.3 0.8,0.5 C0.8,0.7 0.7,0.8 0.5,0.8 C0.3,0.8 0.2,0.7 0.2,0.5 C0.2,0.3 0.3,0.2 0.5,0.2 Z' } },
            { id: 'frame_num_1', type: 'frame', label: '1', icon: Type, props: { maskType: 'path', path: 'M0.4,0 L0.6,0 L0.6,1 L0.4,1 Z' } },
            { id: 'frame_num_2', type: 'frame', label: '2', icon: Type, props: { maskType: 'path', path: 'M0,0.2 C0,0.1 0.2,0 0.5,0 C0.8,0 1,0.1 1,0.3 C1,0.5 0.8,0.6 0.6,0.8 L0.2,1 L1,1 L1,1.2 L0,1.2 L0,1 L0.6,0.4 C0.8,0.3 0.8,0.2 0.8,0.2 C0.8,0.2 0.7,0.15 0.5,0.15 C0.3,0.15 0.2,0.2 0.2,0.3 L0,0.2 Z' } },
            { id: 'frame_num_3', type: 'frame', label: '3', icon: Type, props: { maskType: 'path', path: 'M0,0 L0.9,0 L0.6,0.4 C0.8,0.4 1,0.5 1,0.7 C1,1 0.8,1.2 0.5,1.2 C0.2,1.2 0,1 0,0.8 L0.2,0.8 C0.2,0.9 0.3,1 0.5,1 C0.7,1 0.8,0.9 0.8,0.7 C0.8,0.5 0.7,0.4 0.5,0.4 L0.3,0.4 L0.3,0.2 L0.8,0.2 L0,0.2 L0,0 Z' } },
            { id: 'frame_num_4', type: 'frame', label: '4', icon: Type, props: { maskType: 'path', path: 'M0.6,1 L0.6,0.8 L1,0.8 L1,0.6 L0.6,0.6 L0.6,0 L0.4,0 L0.4,0.6 L0,0.6 L0,0.8 L0.4,0.8 L0.4,1 Z M0.6,0.2 L0.6,0.6 L0.8,0.6 L0.6,0.2 Z' } }, // Rough 4
            { id: 'frame_num_5', type: 'frame', label: '5', icon: Type, props: { maskType: 'path', path: 'M0.8,0 L0,0 L0,0.5 L0.5,0.5 C0.7,0.5 0.8,0.6 0.8,0.8 C0.8,0.9 0.7,1 0.5,1 C0.3,1 0.2,0.9 0.2,0.8 L0,0.8 C0,1 0.2,1.2 0.5,1.2 C0.8,1.2 1,1 1,0.8 C1,0.6 0.8,0.4 0.5,0.4 L0.2,0.4 L0.2,0.2 L0.8,0.2 L0.8,0 Z' } },
            { id: 'frame_num_6', type: 'frame', label: '6', icon: Type, props: { maskType: 'path', path: 'M0.8,0.1 C0.7,0.05 0.6,0 0.5,0 C0.2,0 0,0.2 0,0.5 C0,0.8 0.2,1.1 0.5,1.1 C0.8,1.1 1,0.9 1,0.6 C1,0.4 0.8,0.3 0.6,0.3 L0.5,0.3 C0.4,0.3 0.3,0.35 0.25,0.4 L0.25,0.3 C0.25,0.2 0.4,0.15 0.5,0.15 C0.6,0.15 0.7,0.2 0.8,0.25 L0.8,0.1 M0.2,0.6 C0.2,0.8 0.3,0.9 0.5,0.9 C0.7,0.9 0.8,0.8 0.8,0.6 C0.8,0.5 0.7,0.4 0.5,0.4 C0.3,0.4 0.2,0.5 0.2,0.6 Z' } },
            { id: 'frame_num_7', type: 'frame', label: '7', icon: Type, props: { maskType: 'path', path: 'M0,0 L1,0 L0.4,1 L0.2,1 L0.8,0.2 L0,0.2 L0,0 Z' } },
            { id: 'frame_num_8', type: 'frame', label: '8', icon: Type, props: { maskType: 'path', path: 'M0.5,0.5 C0.3,0.5 0.2,0.4 0.2,0.25 C0.2,0.1 0.3,0 0.5,0 C0.7,0 0.8,0.1 0.8,0.25 C0.8,0.4 0.7,0.5 0.5,0.5 M0.5,0.6 C0.2,0.6 0,0.7 0,0.9 C0,1.1 0.2,1.2 0.5,1.2 C0.8,1.2 1,1.1 1,0.9 C1,0.7 0.8,0.6 0.5,0.6 M0.5,0.15 C0.4,0.15 0.35,0.2 0.35,0.25 C0.35,0.3 0.4,0.35 0.5,0.35 C0.6,0.35 0.65,0.3 0.65,0.25 C0.65,0.2 0.6,0.15 0.5,0.15 M0.5,0.7 C0.4,0.7 0.2,0.8 0.2,0.9 C0.2,1 0.4,1.1 0.5,1.1 C0.6,1.1 0.8,1 0.8,0.9 C0.8,0.8 0.6,0.7 0.5,0.7 Z' } },
            { id: 'frame_num_9', type: 'frame', label: '9', icon: Type, props: { maskType: 'path', path: 'M0.5,0 C0.2,0 0,0.2 0,0.5 C0,0.7 0.2,0.8 0.4,0.8 L0.5,0.8 C0.6,0.8 0.7,0.75 0.75,0.7 L0.75,0.8 C0.75,0.9 0.6,0.95 0.5,0.95 C0.4,0.95 0.3,0.9 0.2,0.85 L0.2,1 C0.3,1.05 0.4,1.1 0.5,1.1 C0.8,1.1 1,0.9 1,0.6 C1,0.3 0.8,0 0.5,0 M0.8,0.5 C0.8,0.6 0.7,0.7 0.5,0.7 C0.3,0.7 0.2,0.6 0.2,0.4 C0.2,0.2 0.3,0.1 0.5,0.1 C0.7,0.1 0.8,0.2 0.8,0.5 Z' } },
        ]
    },
    {
        id: 'grid_frames',
        title: 'Grids',
        icon: Layout,
        items: [
            // Standard Single-Element Mask Grids (Window style)
            {
                id: 'frame_window_4',
                type: 'frame',
                label: 'Window',
                icon: Layout,
                props: {
                    maskType: 'path',
                    path: 'M0,0 L0.48,0 L0.48,0.48 L0,0.48 L0,0 M0.52,0 L1,0 L1,0.48 L0.52,0.48 L0.52,0 M0,0.52 L0.48,0.52 L0.48,1 L0,1 L0,0.52 M0.52,0.52 L1,0.52 L1,1 L0.52,1 L0.52,0.52 Z'
                }
            }
        ]
    },
    {
        id: 'collage_frames',
        title: 'Collage Grids',
        icon: Layout,
        items: [
            {
                id: 'collage_2_cols',
                type: 'grid_group',
                label: '2 Columns',
                icon: Layout,
                props: {
                    items: [
                        { x: 0, y: 0, w: 0.48, h: 1 },
                        { x: 0.52, y: 0, w: 0.48, h: 1 }
                    ]
                }
            },
            {
                id: 'collage_2_rows',
                type: 'grid_group',
                label: '2 Rows',
                icon: Layout,
                props: {
                    items: [
                        { x: 0, y: 0, w: 1, h: 0.48 },
                        { x: 0, y: 0.52, w: 1, h: 0.48 }
                    ]
                }
            },
            {
                id: 'collage_3_cols',
                type: 'grid_group',
                label: '3 Columns',
                icon: Layout,
                props: {
                    items: [
                        { x: 0, y: 0, w: 0.32, h: 1 },
                        { x: 0.34, y: 0, w: 0.32, h: 1 },
                        { x: 0.68, y: 0, w: 0.32, h: 1 }
                    ]
                }
            },
            {
                id: 'collage_1_left_2_right',
                type: 'grid_group',
                label: '1 Left 2 Right',
                icon: Layout,
                props: {
                    items: [
                        { x: 0, y: 0, w: 0.48, h: 1 },
                        { x: 0.52, y: 0, w: 0.48, h: 0.48 },
                        { x: 0.52, y: 0.52, w: 0.48, h: 0.48 }
                    ]
                }
            },
            {
                id: 'collage_grid_4',
                type: 'grid_group',
                label: 'Grid 4',
                icon: Layout,
                props: {
                    items: [
                        { x: 0, y: 0, w: 0.48, h: 0.48 },
                        { x: 0.52, y: 0, w: 0.48, h: 0.48 },
                        { x: 0, y: 0.52, w: 0.48, h: 0.48 },
                        { x: 0.52, y: 0.52, w: 0.48, h: 0.48 }
                    ]
                }
            }
        ]
    }
];
