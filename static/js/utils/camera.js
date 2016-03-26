
define(function (require) {

    'use strict';

    var position = { x: 0, y: 0 },
        settings = { width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 };

    return {
        centerOnEntity: function (entity) {

            if (entity.getMetric('x') > position.x + (settings.width * 0.6)) {

                position.x += Math.abs(entity.getMetric('x') - (position.x + (settings.width * 0.6)));

            } else if (entity.getMetric('x') - entity.getMetric('width') / 2 < position.x + (settings.width * 0.3)) {

                position.x -= Math.abs(entity.getMetric('x') - (entity.getMetric('width') / 2) - (position.x + (settings.width * 0.3)));

            }

            if (entity.getMetric('y') > position.y + (settings.height * 0.6)) {

                position.y += Math.abs(entity.getMetric('y') - (position.y + (settings.height * 0.6)));

            } else if (entity.getMetric('y') - entity.getMetric('height') / 2 < position.y + (settings.height * 0.3)) {

                position.y -= Math.abs(entity.getMetric('y') - (entity.getMetric('height') / 2) - (position.y + (settings.height * 0.3)));

            }

            if (position.x < settings.minX) {

                position.x = settings.minX;

            } else if (position.x > settings.maxX - settings.width) {

                position.x = settings.maxX - settings.width;

            }

            if (position.y < settings.minY) {

                position.y = settings.minY;

            } else if (position.y > settings.maxY - settings.height) {

                position.y = settings.maxY - settings.height;

            }

        },
        position: position,
        settings: settings
    };

});
