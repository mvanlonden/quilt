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
 * GridLayout with sized modifier
 * ------------------------------
 * 
 * GridLayouts will respect their parents size.  When placed behind
 * a modifier with a set size, the layout will expand to that size
 * instead of filling the full window.
 *
 * In this example, we see a GridLayout behind a sized Modifier.
 */

define(function(require, exports, module) {
    var Engine     = require("famous/core/Engine");
    var Surface    = require("famous/core/Surface");
    var Modifier   = require("famous/core/Modifier");
    var GridLayout = require("famous/views/GridLayout");
    var Transitionable = require("famous/transitions/Transitionable");
    var MouseSync = require("famous/inputs/MouseSync");
    var Transform = require("famous/core/Transform");


    var size = new Transitionable([0, 0]);

    var anchor = new Transitionable([0, 0]);

    var selectBox = new Surface({
        classes: ["grey-bg", "selectBox"],
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
    });

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
        var cells = document.getElementsByClassName('cell');
        var selectBox = document.getElementsByClassName('selectBox')[0];
        var selectBoxRect = selectBox.getBoundingClientRect();
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            var cellRect = cell.getBoundingClientRect();
            var overlap = !(cellRect.right < selectBoxRect.left || 
                cellRect.left > selectBoxRect.right || 
                cellRect.bottom < selectBoxRect.top || 
                cellRect.top > selectBoxRect.bottom);
            if(overlap) {
                cell.style.opacity = 1;
            } else {
                cell.style.opacity = 0.5;
            }
        }
    });

    mouseSync.on("end", function (data){
        anchor.set([0,0]);
        size.set([0,0]);
        var cells = document.getElementsByClassName('cell');
        for(var i = 0; i < cells.length; i++){
            var cell = cells[i];
            cell.style.opacity = 0.5;
        }
    });



    var mainContext = Engine.createContext();

    var cells = 16 * 16;

    var grid = new GridLayout({
        dimensions: [16, 16]
    });

    var surfaces = [];
    grid.sequenceFrom(surfaces);

    for(var i = 0; i < cells; i++) {
        surfaces.push(new Surface({
            size: [undefined, undefined],
            classes: ["cell"],
            properties: {
                backgroundColor: "hsl(" + (i * 360 / cells) + ", 100%, 50%)",
                color: "black",
                lineHeight: '100px',
                textAlign: 'center'
            }
        }));
    }

    mainContext.add(selectBoxOpacity).add(selectBoxAnchor).add(selectBoxSize).add(selectBoxRotation).add(selectBox);
    mainContext.add(new Modifier({size: [400, 400], origin: [.5, .5], opacity: 0.5})).add(grid);
});
