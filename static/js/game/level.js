define(function (require) {

    var Facade = require('facade'),
        Plastick = require('plastick'),
        Fiberent = require('../libs/fiberent'),
        SetupWorld = require('./setupWorld'),
        Triggers = require('../utils/triggers');

    require('facadejs-Box2D-plugin');

    var game = require('./game');

    var state = new Plastick.State('level');

    var controller = require('../utils/controller')(state);

    var camera = require('../utils/camera');

    var generateEntityFromObject = require('../utils/box2d').generateEntityFromObject;

    return function (level) {

        state.init(function () {

            controller.resume();

            game.data.physWorld = new Facade.Entity().Box2D('createWorld', { canvas: game.canvas, gravity: [ 0, 20 ] });
            game.data.entWorld = SetupWorld.new();
            game.data.triggers = new Triggers(game.data.entWorld);

            game.data.player1 = game.data.entWorld.createEntities(1, { withTemplates: ['player'], hasName: 'player' })[0];

            var player = game.data.player1.getProp('physical');
            player.obj = generateEntityFromObject({
                    options: {
                        x: 100,
                        y: 100,
                        width: 100,
                        height: 100,
                        image: 'images/sprite.png',
                        frames: [0, 1, 2, 3, 4, 5, 6, 7]
                    },
                    box2d_properties: { type: 'dynamic' }
                }, game.data.physWorld);

            player.obj.play();

            fetch(level).then(function (response) {
                return response.json();
            }).then(function (data) {

                Object.keys(data).forEach(function (type) {

                    var items = data[type];

                    if (items.length) {

                        items.forEach( function (item) {

                            var i = game.data.entWorld.createEntities(1, { withTemplates: ['platform'], hasName: 'platform' })[0];
                            i.getProp('physical').obj = generateEntityFromObject(item, game.data.physWorld);

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

        state.cleanup(function () {

            //console.log(game.data.entWorld.JSON());
        });

        state.update(function () {

            var entWorld = game.data.entWorld,
                triggers = game.data.triggers;
            //triggers.init();

            entWorld.updateSystem('playerInput', triggers, controller);
            entWorld.updateSystem('fireWeapons', triggers, game.currentTick);
            entWorld.updateSystem('updatePhysics', triggers, camera, game.data);

        });

        state.draw(function () {

            game.facade.clear();

            game.data.entWorld.updateSystem('drawViewport', game.facade, camera);

            // Debug translate for Box2D

            // game.context.translate(-camera.position.x, -camera.position.y);

            // game.data.physWorld.Box2D('drawDebug');

        });

        return state;

    };

});
