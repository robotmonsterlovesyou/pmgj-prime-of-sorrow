define(function (require) {

    'use strict';

    return {

        components: {

            physical: {
                obj: null // facade object
            },

            visible: {
                hue: 0,
                direction: {
                    horizontal: 'right',
                    jumping: false,
                    walking: false
                }
            },

            power: {
                jump: 30,
                dampenJump: 0.67,
                run: 20,
                dampenRun: 0.5,
                strength: 100,
                consumeTick: false,
                consumeRate: 0.02,
                consumeVel: 0,
                regenStart: 0,      // timestamp
                regenRate: 1,
                regenDelay: 100
            },

            shot: {
                type: 'pellet',
                source: 'player',
                power: null,
                hitDistance: Infinity,
                target: null,
                lifetime: null
            },

            ui: {
                obj: null, // facade object
                hue: null
            },

            background: {},

            foreground: {}
        },

        templates: {

            background: {
                physical: {},
                visible: {},
                background: {}
            },

            player: {
                physical: {},
                visible: {},
                power: {},
                foreground: {}
            },

            platform: {
                physical: {},
                visible: {},
                foreground: {}
            },
            'platform-friction': {
                physical: {},
                visible: {},
                foreground: {}
            },
            enemy: {
                physical: {},
                visible: {}
            }
        }
    };
});
