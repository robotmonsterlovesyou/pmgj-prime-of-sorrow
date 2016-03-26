define(function (require) {

    'use strict';

    return {

        components: {

            physical: {
                obj: null // box2d object
            },

            visible: {
                sprite: null
            },

            powers: {
                move: 5,
                jump: 3,
                weapon: 5
            },

            shot: {
                type: 'pellet',
                source: 'player',
                power: null,
                hitDistance: Infinity,
                target: null,
                lifetime: null
            },
        },

        templates: {

            player: {
                physical: {},
                visible: {},
                powers: {}
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
