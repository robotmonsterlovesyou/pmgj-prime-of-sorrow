define(function (require) {

    'use strict';

    //var Utils = require('../utils');
    //var Routines = require('./routines');
    var Fiberent = require('../libs/fiberent');

    // helper functions -----------------------------------------

    // helper function for collision detection
    function collisionCircleCircle (x1, y1, r1, x2, y2, r2) {

        var xd = x2 - x1,
            yd = y2 - y1,
            squareDistance = xd * xd + yd * yd;

        if (squareDistance <= (r1 + r2) * (r1 + r2)) return true;
        else return false;
    }

    // returns first intersection point if there is a collision
    function collisionCircleLine (xc, yc, r, x1, y1, x2, y2) {

        var collision = { result: false };

        if (x1 == x2 && y1 == y2) {
            collision = {
                x: x1,
                y: y1,
                l: 0,
                result: collisionCircleCircle(x1, y1, 0, xc, yc, r)
            };
        } else {
            var xd = x2 - x1,
                yd = y2 - y1,
                lineLength = Math.sqrt(xd * xd + yd * yd),
                direction = { x: xd / lineLength, y: yd / lineLength },
                t = direction.x * (xc - x1) + direction.y * (yc - y1),
                closest = {
                    x: t * direction.x + x1,
                    y: t * direction.y + y1,
                    d: 0
                },
                dcx = closest.x - xc,
                dcy = closest.y - yc;
            closest.d = Math.sqrt(dcx * dcx + dcy * dcy);

            if (closest.d <= r) {
                var d = closest.d,
                    dt = Math.sqrt(r * r - d * d),
                    nt = t / lineLength,
                    ndt = dt / lineLength;

                // line segment tests
                // 1. segment passes through circle
                if (nt >= 0 && nt <= 1) collision = {
                    x: (t - dt) * direction.x + x1,
                    y: (t - dt) * direction.y + y1,
                    l: nt - ndt,
                    result: true
                };
                // 2. segment starts or ends in circle
                else {
                    var dc1 = { x: xc - x1, y: yc - y1 },
                        dc2 = { x: xc - x2, y: yc - y2 },
                        squareStart = dc1.x * dc1.x + dc1.y * dc1.y,
                        squareEnd = dc2.x * dc2.x + dc2.y * dc2.y,
                        squareR = r * r;
                    if (squareEnd <= squareR) {
                        collision = {
                            x: (t + dt) * direction.x + x1,
                            y: (t + dt) * direction.y + y1,
                            l: nt + ndt,
                            result: true
                        };
                    }
                    else if (squareStart <= squareR) {
                        collision = {
                            x: (t - dt) * direction.x + x1,
                            y: (t - dt) * direction.y + y1,
                            l: nt - ndt,
                            result: true
                        };
                    }
                    // 3. segment is ouside circle
                    else collision.result = false;
                }
            } else collision.result = false;
        }

        return collision;
    }

    function updateEnergy(player) {


    }
    // Systems --------------------------------------------------

    return {

        // pass Controller object
        playerInput: function (world, controller, player, tick) {

            var e,
                elem = player.getProp('physical').obj;

            while (controller.queue.length) {

                e = controller.queue.shift();

                if (e.type === 'press' && e.button === 'button_1') {

                    elem.Box2D('setVelocity', null, player.getProp('power').strength ? -30 : -20);

                } else if (e.type === 'hold' && e.button === 'd_pad_left') {

                    elem.Box2D('setVelocity', player.getProp('power').strength ? -20 : -10, null);

                } else if (e.type === 'hold' && e.button === 'd_pad_right') {

                    elem.Box2D('setVelocity', player.getProp('power').strength ? 20 : 10, null);

                }

                if (e.type === 'press' && e.button === 'd_pad_left') {

                    elem.load('images/sprite-face-left.png');

                    elem.setOptions({
                        frames: [12, 14, 16, 14],
                        speed: 120
                    });

                    elem.reset();

                } else if (e.type === 'release' && e.button === 'd_pad_left') {

                    elem.load('images/sprite-face-left.png');

                    elem.setOptions({
                        frames: [7, 9],
                        speed: 600
                    });

                    elem.reset();

                } else if (e.type === 'press' && e.button === 'd_pad_right') {

                    elem.load('images/sprite-face-right.png');

                    elem.setOptions({
                        frames: [12, 14, 16, 14],
                        speed: 120
                    });

                    elem.reset();

                } else if (e.type === 'release' && e.button === 'd_pad_right') {

                    elem.load('images/sprite-face-right.png');

                    elem.setOptions({
                        frames: [7, 9],
                        speed: 600
                    });

                    elem.reset();

                }

                // consume energy
                if (e.type === 'hold' && player.getProp('power').consumeStart === null) {
                    player.getProp('power').consumeStart = tick;
                    player.getProp('power').regenStart = null;
                } else if (e.type !== 'hold' && player.getProp('power').regenStart === null) {
                    player.getProp('power').consumeStart = null;
                    player.getProp('power').regenStart = tick;
                }
            }

        },

        updateEnergy: function (world, player, game) {

            var power = player.getProp('power'),
                ui = game.data.ui;

            // check for consumption
            if (power.consumeStart !== null && power.strength > 0) {
                power.strength -= power.consumeRate;
                if (power.strength < 0) power.strength = 0;
                ui.energyBar.getProp('ui').obj.setOptions({
                    width: power.strength * ui.energyUnitPx
                });
            }

            // check for regeneration
            if (power.regenStart !== null && power.strength < 100 &&
                (power.strength > 0 || game.currentTick - power.regenStart > power.regenDelay)) {
                power.strength += power.regenRate;
                if (power.strength > 100) power.strength = 100;
                ui.energyBar.getProp('ui').obj.setOptions({
                    width: power.strength * ui.energyUnitPx
                });
            }
        },

        updatePhysics: function (world, triggers, camera, data) {

            camera.centerOnEntity(data.player1.getProp('physical').obj);
            data.physWorld.Box2D('step');
        },

        fireWeapons: function (world, triggers, tick) {

            /*triggers.forEach('fireWeapon', function (entity) {

                var pos = entity.getProp('position'),
                    weapon = entity.getProp('weapon');

                var shot = world.createEntities(1, { withTemplates: [weapon.type + 'Shot'], withName: 'shot'})[0];
                shot.setProp('metrics', { spawnTime: tick });
                shot.setProp('position', {
                    x: pos.x,
                    y: pos.y,
                    dir: entity.hasComponent('controllable') ? 0 : pos.dir
                });
            });*/
        },

        drawViewport: function (world, facade, camera) {

            // background entities
            world.eachEntity(function (e) {

                var sprite = e.getProp('physical').obj;
                facade.addToStage(sprite, { x: '+=' + -camera.position.x, y: '+=' + -camera.position.y });
            }, { filterComponents: ['physical', 'visible', 'background'] });

            // all entities
            world.eachEntity(function (e) {

                var sprite = e.getProp('physical').obj;
                facade.addToStage(sprite, { x: '+=' + -camera.position.x, y: '+=' + -camera.position.y });
            }, { filterComponents: ['physical', 'visible', 'foreground'] });

            // UI - background
            world.eachEntity(function (e) {

                var sprite = e.getProp('ui').obj;
                facade.addToStage(sprite);
            }, { filterComponents: ['ui', 'background'] });

            // UI - foreground
            world.eachEntity(function (e) {

                var sprite = e.getProp('ui').obj;
                facade.addToStage(sprite);
            }, { filterComponents: ['ui', 'foreground'] });
        },
    };
});
