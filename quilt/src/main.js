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

/**
 * ScrollSync
 * ------------
 * 
 * ScrollSync handles piped in mousewheel events. Can be used
 * as delegate of GenericSync.
 *
 * In this example, we create a ScrollSync and displays the data
 * it recieves to the screen.
 */

define(function(require, exports, module) {
    var Engine     = require("famous/core/Engine");
    var Surface    = require("famous/core/Surface");
    var Modifier  = require("famous/core/Modifier");
    var Transform  = require("famous/core/Transform");
    var Draggable = require('famous/modifiers/Draggable');
    var StateModifier = require('famous/modifiers/StateModifier');

    var View      = require("famous/core/View");

    var ScrollSync = require("famous/inputs/ScrollSync");
    var MouseSync = require("famous/inputs/MouseSync");

    var ContainerSurface = require("famous/surfaces/ContainerSurface");
    var Transitionable = require("famous/transitions/Transitionable");
    var SnapTransition = require('famous/transitions/SnapTransition');
    var WallTransition = require('famous/transitions/WallTransition');

    Transitionable.registerMethod('snap', SnapTransition);
    Transitionable.registerMethod('wall', WallTransition);

    var mainContext = Engine.createContext();
   
    var maxScale = 200;
    var minScale = 0;
    var displaceThreshold = 50;
    var maxDisplace = maxScale + displaceThreshold;
    var minDisplace = minScale - displaceThreshold;
    var perspective = maxDisplace + 120;

    var scale = new Transitionable(0);
    var position = new Transitionable([0, 0]);

    var scrollSync = new ScrollSync();
    var mouseSync = new MouseSync();

    mainContext.setPerspective(perspective);

    var backgroundSurface = new Surface({
        size: [undefined, undefined],
        classes: ['grey-bg']
    });

    var canvas = new ContainerSurface({
        size: [200, 200],
        properties: {
            background: '#F05500',
            textAlign: 'center',
        }
    });



    var patchLeft = new Surface({
        size: [100, undefined],
        content: "<img style='width: auto; height: 100%; margin-left: -6px' src='https://d13yacurqjgara.cloudfront.net/users/1636/screenshots/1480992/attachments/221354/Real-pixels.png'></img>",
        properties: {
           backgroundColor: "hsl(" + (1 * 360 / 3) + ", 100%, 50%)",
            overflow: 'hidden'

        }
    });

    var patchTopRight = new Surface({
        size: [100, 100],
        content: "<img style='width: auto; height: 100%' src='https://d13yacurqjgara.cloudfront.net/users/1636/screenshots/1467205/homescreen-large.jpg'></img>",
        properties: {
           backgroundColor: "hsl(" + (2 * 360 / 3) + ", 100%, 50%)",
            overflow: 'hidden'
        }
    });

    var patchBottomRight = new Surface({
        size: [100, 100],
        content: "<img style='width: auto; height: 100%' src='https://d13yacurqjgara.cloudfront.net/users/1636/screenshots/1548855/measure-shot-2.gif'></img>",
        properties: {
           backgroundColor: "hsl(" + (3 * 360 / 3) + ", 100%, 50%)",
            overflow: 'hidden'
        }
    });

    //Static positioning modifiers

    var centerModifier = new Modifier({origin : [0.5, 0.5]});

    var patchPositionLeft = new Modifier({
        origin: [0, 0]
    });

    var patchPositionTopRight = new Modifier({
        origin: [1, 0]
    });

    var patchPositionBottomRight = new Modifier({
        origin: [1, 1]
    });

    var initScaleModifier = new Modifier({
        transform: Transform.translate(0, 0, displaceThreshold  + 50)
    });

    //Dynamic positioning modifiers

    var scaleModifier = new Modifier({
        transform : function(){
            var currentScale = scale.get();
            return Transform.translate(0, 0, currentScale);
        }
    });

    var panModifier = new StateModifier({
        transform: function(){
            var currentPosition = position.get();
            return Transform.translate(currentPosition[0], currentPosition[1]);
        }
    })

    

    //Scaling listeners

    Engine.pipe(scrollSync);

    scrollSync.on("update", function(data) {
        var currentScale = scale.get();
        var delta = data.delta[1] /100;

        if (currentScale > maxDisplace){
            scale.set( currentScale );
        } else if (currentScale < minDisplace){
            scale.set( currentScale );
        } else {
            scale.set( currentScale + delta );
        }
    });

    scrollSync.on("end", function() {
        if(scale.get() < minScale){
            scale.set(minScale, {method : 'wall',   dampingRatio : 0.5, period : 500});
        }
        if(scale.get() > maxScale){
            scale.set(maxScale, {method : 'wall',   dampingRatio : 0.5, period : 500});
        }
    });

    //Panning listeners

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

    draggable.subscribe(canvas);

    canvas.add(patchPositionLeft).add(patchLeft);
    canvas.add(patchPositionTopRight).add(patchTopRight);
    canvas.add(patchPositionBottomRight).add(patchBottomRight);
    mainContext.add(centerModifier).add(initScaleModifier).add(scaleModifier).add(draggable).add(canvas);
    mainContext.add(backgroundSurface);
});
