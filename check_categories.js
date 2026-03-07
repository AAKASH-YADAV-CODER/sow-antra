const { shapeCategories } = require('./src/config/shapesLibrary');
const { frameCategories } = require('./src/config/frameLibrary');

console.log('Checking shapeCategories...');
shapeCategories.forEach(cat => {
    cat.items.forEach(item => {
        if (!item.icon) {
            console.log(`MISSING ICON in shapeCategories: ${item.id}`);
        }
    });
});

console.log('Checking frameCategories...');
frameCategories.forEach(cat => {
    cat.items.forEach(item => {
        if (!item.icon) {
            console.log(`MISSING ICON in frameCategories: ${item.id}`);
        }
    });
});
console.log('Done.');
