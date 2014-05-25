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
 * Context
 * -------
 *
 * A context is the root of the render tree.  In order for a Famo.us renderable
 * (such as a Surface) to be rendered, it either needs to be added to the context
 * or added to a node that has been added to the context.
 *
 * In HTML, the new context is added to the body tag as a <div> with class
 * 'famous-container'. Renderables added to the context will be child nodes of
 * this container.
 *
 * In this example, we create a context and add a Famo.us surface to it so that
 * the surface will be rendered on the screen.
 * 
 */

define(function(require, exports, module) {
    var Engine  = require("famous/core/Engine");
    var Surface = require("famous/core/Surface");
    var MouseSync = require("famous/inputs/MouseSync");
    var Modifier = require("famous/core/Modifier");
    var Transform = require("famous/core/Transform");

    var Transitionable = require("famous/transitions/Transitionable");

    var GridLayout = require("famous/views/GridLayout");

    var mainContext = Engine.createContext();

    var size = new Transitionable([0, 0]);

    var anchor = new Transitionable([0, 0]);

    var grid = new GridLayout({
        dimensions: [4, 2]
    });

    var surfaces = [];
    grid.sequenceFrom(surfaces);

    for(var i = 0; i < 8; i++) {
        surfaces.push(new Surface({
        content: "panel " + (i + 1),
        size: [undefined, undefined],
        properties: {
            backgroundColor: "hsl(" + (i * 360 / 8) + ", 100%, 50%)",
            color: "#404040",
            lineHeight: '200px',
            textAlign: 'center'
        }
        }));
    }

    var surface = new Surface({
        size: [200, 200],
        content: "Hello World",
        classes: ["red-bg"],
        properties: {
            lineHeight: "200px",
            textAlign: "center"
        }
    });

    var selectBox = new Surface({
        classes: ["grey-bg"],
    });

    var selectBoxSize = new Modifier({
        size: function(){
            var currentSize = size.get();
            if((currentSize[0] < 0 && currentSize[1] > 0) || (currentSize[0] > 0 && currentSize[1] < 0)){
                return [Math.abs(currentSize[1]), Math.abs(currentSize[0])];
            }
            return [Math.abs(currentSize[0]), Math.abs(currentSize[1])];
        }
    });

    var selectBoxAnchor = new Modifier({
        transform: function(){
            var currentPosition = anchor.get();
            return Transform.translate(currentPosition[0], currentPosition[1], 0);
        }
    });

    var selectBoxRotation = new Modifier({
        transform: function(){
            var currentSize = size.get();
            if(currentSize[0] < 0 && currentSize[1] < 0){
                return Transform.rotateZ(Math.PI);
            } 
            if(currentSize[0] < 0 && currentSize[1] > 0){
                return Transform.rotateZ(Math.PI / 2);
            }
            if(currentSize[0] > 0 && currentSize[1] < 0){
                return Transform.rotateZ(Math.PI * 3 / 2);
            }
        }
    })

    var selectBoxOpacity = new Modifier({
        opacity: 0.2
    });

    var mouseSync = new MouseSync();

    Engine.pipe(mouseSync);

    mouseSync.on("start", function (data){
        anchor.set([data.clientX, data.clientY]);
    });

    mouseSync.on("update", function (data){
        size.set(data.position);
    });

    mouseSync.on("end", function (data){
        anchor.set([0,0]);
        size.set([0,0]);
    })

    mainContext.add(grid);
    mainContext.add(selectBoxOpacity).add(selectBoxAnchor).add(selectBoxSize).add(selectBoxRotation).add(selectBox);
});
