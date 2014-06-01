/**
 * Copyright (c) 2014 Famous Industries, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a 
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in 
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE.
 *
 * @license MIT
 */

define(function(require, exports, module) {
    var Engine     = require("famous/core/Engine");
    var Surface    = require("famous/core/Surface");
    var Modifier  = require("famous/core/Modifier");
    var Transform  = require("famous/core/Transform");
    var Draggable = require('famous/modifiers/Draggable');
    var StateModifier = require('famous/modifiers/StateModifier');

    var View      = require("famous/core/View");

    var MouseSync = require("famous/inputs/MouseSync");

    var Transitionable = require("famous/transitions/Transitionable");

    var mainContext = Engine.createContext();

    var perspective = 600;

    var position = new Transitionable([0, 0]);

    var mouseSync = new MouseSync();

    mainContext.setPerspective(perspective);

    var backgroundSurface = new Surface({
        size: [undefined, undefined],
        classes: ['grey-bg']
    });

    var surface = new Surface({
        size: [200, 200],
        properties: {
            background: '#F05500',
            textAlign: 'center',
        }
    });

    //Static positioning modifiers

    var centerModifier = new Modifier({origin : [0.5, 0.5]});

    var initScaleModifier = new Modifier({
        transform: Transform.translate(0, 0, 300)
    });

    //Dynamic positioning modifiers
    var panModifier = new StateModifier({
        transform: function(){
            var currentPosition = position.get();
            return Transform.translate(currentPosition[0], currentPosition[1]);
        }
    })

    //Panning listener

    Engine.pipe(mouseSync);

    mouseSync.on("update", function(data){
        var currentPosition = position.get();
        position.set([
            currentPosition[0] + data.delta[0],
            currentPosition[1] + data.delta[1]
        ]);
    });

    //var view 

    var draggable = new Draggable();

    draggable.subscribe(surface);

    mainContext.add(centerModifier).add(initScaleModifier).add(draggable).add(surface);
    mainContext.add(backgroundSurface);
});
