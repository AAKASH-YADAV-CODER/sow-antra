
/**
 * Canva-style Frame Library Configuration
 * Defines types of frames for image and video masking.
 */

import {
    Square, Circle, Smartphone, Laptop, Monitor,
    Globe, Instagram, Facebook, Youtube, Music2,
    Layout, Star, Hexagon, Heart, Cloud, Shield
} from 'lucide-react';

export const frameCategories = [
    {
        id: 'basic_frames',
        title: 'Frames',
        items: [
            { id: 'frame_rect', type: 'frame', label: 'Rectangle', icon: Square, props: { maskType: 'rect' } },
            { id: 'frame_circle', type: 'frame', label: 'Circle', icon: Circle, props: { maskType: 'circle' } },
            { id: 'frame_rounded', type: 'frame', label: 'Rounded', icon: Square, props: { maskType: 'rounded', borderRadius: 20 } },
            { id: 'frame_triangle', type: 'frame', label: 'Triangle', icon: Layout, props: { maskType: 'polygon', points: '0.5,0 1,1 0,1' } },
            { id: 'frame_star', type: 'frame', label: 'Star', icon: Star, props: { maskType: 'star', points: 5 } },
            { id: 'frame_hexagon', type: 'frame', label: 'Hexagon', icon: Hexagon, props: { maskType: 'polygon', points: '0.25,0 0.75,0 1,0.5 0.75,1 0.25,1 0,0.5' } },
            { id: 'frame_octagon', type: 'frame', label: 'Octagon', icon: Hexagon, props: { maskType: 'polygon', points: '0.3,0 0.7,0 1,0.3 1,0.7 0.7,1 0.3,1 0,0.7 0,0.3' } },
            { id: 'frame_heart', type: 'frame', label: 'Heart', icon: Heart, props: { maskType: 'heart' } },
            { id: 'frame_cloud', type: 'frame', label: 'Cloud', icon: Cloud, props: { maskType: 'cloud' } },
            { id: 'frame_shield', type: 'frame', label: 'Shield', icon: Shield, props: { maskType: 'polygon', points: '0,0 1,0 1,0.6 0.5,1 0,0.6' } },
            { id: 'frame_flower', type: 'frame', label: 'Flower', icon: Star, props: { maskType: 'flower' } },
            { id: 'frame_pill', type: 'frame', label: 'Pill', icon: Square, props: { maskType: 'rounded', borderRadius: 999 } },
        ]
    },
    {
        id: 'device_frames',
        title: 'Devices',
        items: [
            { id: 'frame_phone', type: 'frame', label: 'Phone', icon: Smartphone, props: { maskType: 'device', deviceType: 'phone' } },
            { id: 'frame_laptop', type: 'frame', label: 'Laptop', icon: Laptop, props: { maskType: 'device', deviceType: 'laptop', width: 250, height: 160 } },
            { id: 'frame_desktop', type: 'frame', label: 'Desktop', icon: Monitor, props: { maskType: 'device', deviceType: 'desktop', width: 250, height: 200 } },
            { id: 'frame_browser', type: 'frame', label: 'Browser', icon: Globe, props: { maskType: 'device', deviceType: 'browser', width: 300, height: 200 } },
        ]
    },
    {
        id: 'social_frames',
        title: 'Social Media',
        items: [
            { id: 'frame_ig_post', type: 'frame', label: 'IG Post', icon: Instagram, props: { maskType: 'rect', width: 200, height: 200 } },
            { id: 'frame_ig_story', type: 'frame', label: 'IG Story', icon: Instagram, props: { maskType: 'rounded', borderRadius: 10, width: 150, height: 266 } },
            { id: 'frame_fb_post', type: 'frame', label: 'FB Post', icon: Facebook, props: { maskType: 'rect', width: 200, height: 150 } },
            { id: 'frame_yt_thumb', type: 'frame', label: 'YouTube', icon: Youtube, props: { maskType: 'rect', width: 240, height: 135 } },
            { id: 'frame_tiktok', type: 'frame', label: 'TikTok', icon: Music2, props: { maskType: 'rounded', borderRadius: 12, width: 150, height: 266 } },
        ]
    }
];

export const getAllFrames = () => {
    return frameCategories.reduce((acc, cat) => [...acc, ...cat.items], []);
};
