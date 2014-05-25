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
var Modifier = require("famous/core/Modifier");
var Transform = require("famous/core/Transform");

var mainContext = Engine.createContext();

mainContext.setPerspective(200);

var front = new Surface({
    size: [200, 200],
    content: "Hello World",
    classes: ["red-bg"],
    properties: {
        lineHeight: "200px",
        textAlign: "center"
    }
});

var back = new Surface({
    size: [200, 200],
    content: "Hello World",
    classes: ["grey-bg"],
    properties: {
        lineHeight: "200px",
        textAlign: "center"
    }
});

var rotateX = new Modifier({
    origin : [.5,.5],
    transform : Transform.rotateX(Math.PI/4)
});

var scale = new Modifier({
  transform : Transform.translate(200,200,50)
});

var scale1 = new Modifier({
  transform : Transform.translate(400,200,0)
});


mainContext.add(scale).add(front);
mainContext.add(scale1).add(back);

});
