define(function (require) {

    'use strict';

    var Fiberent = require('fiberent');

    return function (fiberent) {

        this._fiberent = fiberent;
        this.data = {};

        this.init = function () {

            this.data = {};
        };

        this.add = function (type, entity) {

            if (!this.data[type]) this.data[type] = [];
            this.data[type][entity.ID] = true;
        };

        this.remove = function (type, entity) {

            if (type === undefined) this.data = {};
            else if (this.data[type] !== undefined) {
                if (entity === undefined) this.data[type] = [];
                else this.data[type][entity.ID] = undefined;
            }
        };

        this.get = function (type, entity) {

            if (type === undefined) return this.data;
            else if (this.data[type] !== undefined) return this.data[type][entity.ID];
            else return undefined;
        };

        // pass in func(entity)
        this.forEach = function (type, func) {

            var f = this._fiberent;
            if(this.data[type] !== undefined)
                Object.keys(this.data[type]).forEach(function (key) {
                    func(f.getEntity(key));
                });
        };
    };
});
