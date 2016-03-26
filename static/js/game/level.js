define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick');

    require('facadejs-Box2D-plugin');

    var game = require('./game');

    var state = new Plastick.State('level');

    var controller = require('../utils/controller')(state);

    var camera = require('../utils/camera');

    var generateEntityFromObject = require('../utils/box2d').generateEntityFromObject;

    return function (level) {

        var world = new Facade.Entity().Box2D('createWorld', { canvas: game.canvas, gravity: [ 0, 20 ] });

        var entities = {
            platforms: [],
            player1: generateEntityFromObject({
                options: { x: 100, y: 100, width: 50, height: 50 },
                box2d_properties: {
                    type: 'dynamic'
                }
            }, world)
        };

        state.init(function () {

            fetch(level).then(function (response) {
                return response.json();
            }).then(function (data) {

                Object.keys(data).forEach(function (type) {

                    var items = data[type];

                    if (items.length) {

                        entities[type] = items.map(function (item) {

                            return generateEntityFromObject(item, world);

                        });

                    }

                });

                if (data.camera) {

                    Object.keys(data.camera).forEach(function (key) {

                        camera.settings[key] = data.camera[key];

                    });

                }

            });

        });

        state.update(function () {

            camera.centerOnEntity(entities.player1);

            world.Box2D('step');

        });

        state.draw(function () {

            game.facade.clear();

            // game.facade.addToStage([
            //     entities.platforms,
            //     entities.player1
            // ], { x: '+=' + -camera.position.x, y: '+=' + -camera.position.y });

            // Debug translate for Box2D

            game.context.translate(-camera.position.x, -camera.position.y);

            world.Box2D('drawDebug');

        });

        return {
            world: world,
            entities: entities,
            state: state
        };

    };

});
