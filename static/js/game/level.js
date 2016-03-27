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
                        x: 2415,
                        y: 100,
                        width: 100,
                        height: 100,
                        image: 'images/sprite-face-right.png',
                        frames: [7, 9],
                        speed: 600,
                        scale: 0.7
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

                            var i = game.data.entWorld.createEntities(1, { withTemplates: [type], hasName: type })[0];
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

            // UI bar
            game.data.ui = {};
            var ui = game.data.ui;
            ui.energyBarC = game.data.entWorld.createEntities(1, { withComponents: ['ui', 'background'], hasName: 'energy-bar-container' })[0];
            ui.energyBarC.getProp('ui').obj = Facade.Image('images/energy-bar2.png', {
                x: 20,
                y: 20,
                tileX: 100,
                anchor: 'top/left'
            });
            ui.energyUnitPx = 2;//ui.energyBarC.getProp('ui').obj.getMetric('width');
            //console.log(ui.energyBarC.getProp('ui').obj);

            ui.energyBar = game.data.entWorld.createEntities(1, { withComponents: ['ui', 'foreground'], hasName: 'energy-bar' })[0];
            ui.energyBar.getProp('ui').obj = Facade.Rect({
                x: 20,
                y: 20 + ui.energyUnitPx,
                width: game.data.player1.getProp('power').strength * ui.energyUnitPx,
                height: 12,
                fillStyle: 'hsla(0, 100%, 50%, 0.7)',
                anchor: 'top/left'
            });


        });

        state.cleanup(function () {

            //console.log(game.data.entWorld.JSON());
        });

        state.update(function () {

            var entWorld = game.data.entWorld,
                triggers = game.data.triggers;
            //triggers.init();

            entWorld.updateSystem('playerInput', controller, game.data.player1, game.currentTick);
            entWorld.updateSystem('updateEnergy', game.data.player1, game);
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
