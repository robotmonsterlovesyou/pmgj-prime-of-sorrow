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
                strength: 100
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

            player: {
                physical: {},
                visible: {},
                power: {}
            },

            platform: {
                physical: {},
                visible: {}
            },
            enemy: {
                physical: {},
                visible: {}
            }
        }
    };
});
