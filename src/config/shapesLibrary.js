
/**
 * Canva-style Shapes Library Configuration
 * Defines categories, variants, and element properties for the "Elements" panel.
 */

import {
    Square, Circle, Triangle, Star, Hexagon,
    ArrowRight, Minus, MessageSquare, Heart,
    Activity, Info, AlertCircle,
    HelpCircle, CheckCircle, XCircle, MapPin, PlayCircle, PauseCircle,
    Bookmark, Tag, CreditCard, Layout, Shield, Flag, Cloud, Search
} from 'lucide-react';

export const shapeCategories = [
    {
        id: 'basic',
        title: 'Basic Geometric Shapes',
        items: [
            { id: 'square', type: 'rectangle', label: 'Square', icon: Square },
            { id: 'rounded_square', type: 'rectangle', label: 'Rounded Square', icon: Square, props: { borderRadius: 20 } },
            { id: 'circle', type: 'circle', label: 'Circle', icon: Circle },
            { id: 'triangle', type: 'triangle', label: 'Triangle', icon: Triangle },
            { id: 'right_triangle', type: 'triangle_right', label: 'Right Triangle', icon: Triangle },
            { id: 'diamond', type: 'diamond', label: 'Diamond', icon: Square, props: { sides: 4 } },
            { id: 'pentagon', type: 'regularPolygon', label: 'Pentagon', icon: Hexagon, props: { sides: 5 } },
            { id: 'hexagon', type: 'regularPolygon', label: 'Hexagon', icon: Hexagon, props: { sides: 6 } },
            { id: 'octagon', type: 'regularPolygon', label: 'Octagon', icon: Hexagon, props: { sides: 8 } },
            { id: 'decagon', type: 'regularPolygon', label: 'Decagon', icon: Hexagon, props: { sides: 10 } },
            { id: 'star_5', type: 'star', label: 'Star', icon: Star, props: { points: 5, innerRadius: 0.4 } },
            { id: 'star_6', type: 'star', label: 'Star (6)', icon: Star, props: { points: 6, innerRadius: 0.4 } },
            { id: 'star_12', type: 'star', label: 'Burst', icon: Star, props: { points: 12, innerRadius: 0.6 } },
            { id: 'heart', type: 'heart', label: 'Heart', icon: Heart },
            { id: 'cross', type: 'cross', label: 'Cross', icon: XCircle },
            { id: 'trapezoid', type: 'trapezoid', label: 'Trapezoid', icon: Layout },
            { id: 'parallelogram', type: 'parallelogram', label: 'Parallelogram', icon: Layout },
        ]
    },
    {
        id: 'design',
        title: 'Design Elements',
        items: [
            { id: 'shield', type: 'shield', label: 'Shield', icon: Shield },
            { id: 'banner', type: 'banner', label: 'Banner', icon: Flag },
            { id: 'ribbon', type: 'ribbon', label: 'Ribbon', icon: Bookmark },
            { id: 'flower', type: 'regularPolygon', label: 'Flower', icon: Star, props: { sides: 24 } },
            { id: 'sun', type: 'star', label: 'Sun', icon: Star, props: { points: 16, innerRadius: 0.7 } },
            { id: 'cloud', type: 'thought_bubble', label: 'Cloud', icon: Cloud },
        ]
    },
    {
        id: 'lines',
        title: 'Lines & Dividers',
        items: [
            { id: 'line_straight', type: 'line', label: 'Line', icon: Minus },
            { id: 'line_dashed', type: 'line', label: 'Dashed', icon: Minus, props: { strokeDasharray: '10,10' } },
            { id: 'line_dotted', type: 'line', label: 'Dotted', icon: Minus, props: { strokeDasharray: '5,5', strokeLinecap: 'round' } },
            { id: 'line_thick', type: 'line', label: 'Thick', icon: Minus, props: { strokeWidth: 8 } },
            { id: 'line_double', type: 'line_double', label: 'Double', icon: Minus },
        ]
    },
    {
        id: 'arrows',
        title: 'Arrows & Connectors',
        items: [
            { id: 'arrow_basic', type: 'arrow', label: 'Arrow', icon: ArrowRight },
            { id: 'arrow_thin', type: 'arrow', label: 'Thin Arrow', icon: ArrowRight, props: { strokeWidth: 2 } },
            { id: 'arrow_thick', type: 'arrow', label: 'Thick Arrow', icon: ArrowRight, props: { strokeWidth: 8 } },
            { id: 'arrow_dashed', type: 'arrow', label: 'Dashed Arrow', icon: ArrowRight, props: { strokeDasharray: '5,5' } },
            { id: 'arrow_double', type: 'arrow_double', label: 'Double Arrow', icon: ArrowRight },
        ]
    },
    {
        id: 'callouts',
        title: 'Callouts & Speech',
        items: [
            { id: 'speech_bubble', type: 'speech_bubble', label: 'Speech', icon: MessageSquare },
            { id: 'speech_bubble_round', type: 'speech_bubble_round', label: 'Round Speech', icon: MessageSquare },
            { id: 'thought_bubble', type: 'thought_bubble', label: 'Thought', icon: MessageSquare },
            { id: 'callout_box', type: 'callout', label: 'Callout', icon: Layout },
        ]
    },
    // Future Categories (Placeholders as implementation grows)
    {
        id: 'ui',
        title: 'UI & Info Shapes',
        items: [
            { id: 'pill', type: 'rectangle', label: 'Pill', icon: Square, props: { height: 40, width: 120, borderRadius: 100 } },
            { id: 'badge', type: 'regularPolygon', label: 'Badge', icon: Star, props: { sides: 20, fill: '#ef4444' } },
            { id: 'card', type: 'rectangle', label: 'Card', icon: CreditCard, props: { width: 200, height: 120, borderRadius: 8, shadow: true } },
            { id: 'location', type: 'location', label: 'Pin', icon: MapPin },
        ]
    }
];

// Helper to get all items flat
export const getAllShapes = () => {
    return shapeCategories.reduce((acc, cat) => [...acc, ...cat.items], []);
};
