define(function (require) {

    'use strict';

    return {

        components: {

            physical: {
                obj: null // facade object
            },

            visible: {
                hue: 0
            },

            power: {
                strength: 100,
                consumeStart: null, // timestamp
                consumeRate: 1,
                regenStart: 0,      // timestamp
                regenRate: 1,
                regenDelay: 100,
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
            enemy: {
                physical: {},
                visible: {}
            }
        }
    };
});
