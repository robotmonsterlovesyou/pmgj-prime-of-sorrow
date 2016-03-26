define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick'),
        Fiberent = require('../libs/fiberent'),
        SetupWorld = require('./setupWorld');

    require('facadejs-Box2D-plugin');

    var game = require('./game');

    var state = new Plastick.State('level');

    var controller = require('../utils/controller')(state);

    var camera = require('../utils/camera');

    var generateEntityFromObject = require('../utils/box2d').generateEntityFromObject;

    return function (level) {

        state.init(function () {

            game.data.physWorld = new Facade.Entity().Box2D('createWorld', { canvas: game.canvas, gravity: [ 0, 20 ] });

            game.data.entWorld = SetupWorld.new();

            //world.createEntities(1, { withTemplates: ['player'], hasName: 'player' });
            game.data.entities = {
                platforms: [],
                player1: generateEntityFromObject({
                    options: { x: 100, y: 100, width: 50, height: 50 },
                    box2d_properties: {
                        type: 'dynamic'
                    }
                }, game.data.physWorld)
            };

            fetch(level).then(function (response) {
                return response.json();
            }).then(function (data) {

                Object.keys(data).forEach(function (type) {

                    var items = data[type];

                    if (items.length) {

                        game.data.entities[type] = items.map(function (item) {

                            return generateEntityFromObject(item, game.data.physWorld);

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

            camera.centerOnEntity(game.data.entities.player1);

            game.data.physWorld.Box2D('step');

        });

        state.draw(function () {

            game.facade.clear();

            // game.facade.addToStage([
            //     game.data.entities.platforms,
            //     game.data.entities.player1
            // ], { x: '+=' + -camera.position.x, y: '+=' + -camera.position.y });

            // Debug translate for Box2D

            game.context.translate(-camera.position.x, -camera.position.y);

            game.data.physWorld.Box2D('drawDebug');

        });

        return state;

    };

});
