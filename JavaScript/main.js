/*MIT License

Copyright (c) 2017 Isaac James Thimbleby

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE./*

//---------------------------------------------------------------------------------- 
//	ver   	date        rfc     auth    comments                                         
// --------------------------------------------------------------------------------- 
//	0.1.0   20170927    IT      IT      

// **********************
// Working Memory
// Reverse Span Digit
// *********************

/*function createClass(name,rules){
	var style = document.createElement('style');
	style.type = 'text/css';
	document.getElementsByTagName('head')[0].appendChild(style);
	if(!(style.sheet||{}).insertRule) 
		(style.styleSheet || style.sheet).addRule(name, rules);
	else
		style.sheet.insertRule(name+"{"+rules+"}",0);
}

createClass('.svgtxt',	"-webkit-touch-callout:none; -webkit-user-select:none; -khtml-user-select:none; -moz-user-select:none; -ms-user-select:none; -o-user-select:none; user-select:none;");
createClass('.numberpadButtonText',	"-webkit-touch-callout:none; -webkit-user-select:none; -khtml-user-select:none; -moz-user-select:none; -ms-user-select:none; -o-user-select:none; user-select:none;");
createClass('.numpadtxt',	"-webkit-touch-callout:none; -webkit-user-select:none; -khtml-user-select:none; -moz-user-select:none; -ms-user-select:none; -o-user-select:none; user-select:none;");
createClass('.numpad',	"stroke:green; fill:none; stroke-width:3.5;");
createClass('.sequenceBox',	"stroke:green; fill:green; stroke-width:3.5;");
createClass('.sequenceBox2',	"stroke:black; fill:black; stroke-width:3.5;");

// Start time;
var TESTTYPE = "standard";
var d = new Date;
var startTime = d.getTime();
Math.seedrandom(""+startTime);*/

var pathPrefix = "Other Files";
// updateTime controls how long transitions take.
var updateTime = 150;
// fade controls how long each number in the sequence is presented for
var fade = 1500;
//var fade = 300;
// delay controls the amount of time paused before presenting the sequence
var delay = 600;
// lineSize is the font size used for the number pad, repeat button and sequence numbers
var lineSize = 35;
// numpadTextSize is the font size used for the entry display
var numpadTextSize = 25;
// boxWidth is the size of the numberpad's buttons
var boxWidth = lineSize*1.5;
// indent is the margin around the left and right edge of the graphics.
var indent = 20;
var windowAdjust = ($(window).width()/2)-(boxWidth*3/2+indent);
var finishAdjust = 180;
// w and h are the sizes of the svg element 
// h should be tidied up (everywhere) so that indent is the margin for the top and bottom - very non urgent though.
// Current top and bottom margine is approx lineSize/2.
var w = $(window).width(); //indent*2+3*boxWidth;
var h = 380+indent; //indent*2+boxWidth*6+lineSize/2;
// highlight, normal and deactive are the opacity percentages used for various states of buttons
var highlight = 1, normal = 0.55, deactive = 0.10;
// questionLengths determines the length of the sequences. 
// questionLengths[0] are all example items, and questionLengths[1] are all normal items.
var questionLengths = [[2,3],[3,4,5,6,7,8,9,10,11]];
// item is the current sequence length
var item = -1;
// The questionsAsked array stores all data gathered
// questionsAsked[0] is the test start time
// ...[1] is test item start time
// ...[2] is sequenceFinished time per item (participant can now answer the test item)
// ...[3][x] are test item button push times
// ...[4][x] are test item button push types 
//           (For example items, will include sequence finished times for participants who requested repeat sequences)
// ...[5] is the participant's answer to each test item
// ...[6] is the correct answer to each test item (thisSequence is the reverse of the current answer)
// [7] & [8] are used for debugging/QA, see scoreTest() for removal --XXXXXXX--
var dStart = new Date();
var questionsAsked = [dStart.getTime(),[],[],[[]],[[]],[],[],[],[]];
// difficulty is the current test item number
var difficulty = 0;
// sequenceFinished is a boolean that is true if no sequence is currently being displayed.
// while false participants cannot enter data.
var sequenceFinished = false;
// currentEntry is the data the participant has entered 
// (the delete button removes elements from currentEntry, but not from questionsAsked 
// - although a note is made there that delete has been used)
var currentEntry = [];
// thisSequence is the current sequence (i.e. the reverse of the correct answer)
var thisSequence = [];
// End criteria - completed all items, or getting lots wrong (to avoid discouragement and asking participants pointless questions)
var endCriteria = false;

function returnStringArray (Arr) {
	if (!(Object.prototype.toString.call( Arr ) === '[object Array]'))
		return "Not an Array!: '"+Arr+"'";
	var temp = "[";
	for (var x = 0; x < Arr.length; x++) {
		if (Object.prototype.toString.call( Arr[x] ) === '[object Array]')
			temp+=returnStringArray(Arr[x]);
		else
			temp+=Arr[x]
		if (x < Arr.length - 1)
			temp+=", "
	}
	temp+="]"
	return temp;
}

var svg = d3.select("body")
			.append("svg")
						   .attr("width", w)
						   .attr("height", h)
						   .attr("id", "myCanvas");

function generateSequence (spanLength) {
	// Sequences are generated randomly using the digits 0-9.
	// Repetition of the same digit is suppressed within digit spans of 4 digits or less
	// This is done to avoid high occurence of repeated digits
	// 3/4 digit 'chunking' is common in real world situations (e.g. phone numbers and car reg plates)
	var sequence = [];
	var reverseSequence = [];
	for (var x = 0; x < spanLength; x++) {
		var testDigit = Math.floor(Math.random()*10);
		while (sequence.includes(testDigit,-5)) {
			testDigit = Math.floor(Math.random()*10);
		}
		sequence.push(testDigit);
	}
	for (var x = 0; x < spanLength; x++) {
		reverseSequence.push(sequence[(sequence.length-1)-x]);
	}
	questionsAsked[6].push(reverseSequence);
	return sequence;
}

function scoreTest () {
	// Due to use of Levenshtein to compare strings, 0 is a perfect score.
	console.log("mostRecentEntry: "+questionsAsked[5][questionsAsked[5].length-1]);
	console.log("mostRecentSequence: "+questionsAsked[6][questionsAsked[5].length-1]);
	//console.log("Testing Bug:");
	//console.log("DLdistance: "+levenshtein("84631","7345"));
	//console.log("score: "+levenshtein("84631","7345")/10);
	var results = [];
	for (var i = 0; i < questionsAsked[5].length; i++) {
	    //var siftResult = sift4(questionsAsked[5][i].join(''), questionsAsked[6][i].join(''),5,6);
	    /*console.log("siftResult: "+siftResult);
	    console.log("maxLength: "+Math.max(questionsAsked[5][i].length,questionsAsked[6][i].length))*/
		results.push(levenshtein(questionsAsked[5][i].join(''), questionsAsked[6][i].join(''))/questionsAsked[6][i].length);
	}
	console.log("Current Scores: "+returnStringArray(results));
	questionsAsked[7].push("thisScore : " + results[results.length-1]);
	// the following checks if the test should end early
	var newRange = 2;
	if (results.length > questionLengths[0].length+newRange) {
		var testLength = 2;
		var upperbound = 2;
		var notPerf = 0;
		for (var x = 0; x < testLength; x++) {
			if (results[results.length-(x+1)] > 1/questionLengths[1][results.length-(x+1)-questionLengths[0].length]) {
				notPerf++;
			}
		}
		
		if (notPerf >= upperbound) {
			endCriteria = true;
			var endDate = new Date();
			questionsAsked.push("endCriteriaAtTime : "+endDate.getTime() + ", atItem : "+questionsAsked[5].length);
			console.log("End criteria reached");
		}
	}
	return results;
}

function lengthRemembered() {
	// 'Quantity' of correctly remembered digits
	// Length (1 - Levenshtein/Length) = total * (1 - ~%wrong) = total * ~%correct
	// = Length - Levenshtein
	var testLR = [];
	for (var i = 0; i < questionsAsked[6].length; i++) {
		testLR.push(Math.max(questionsAsked[6][i].length-levenshtein(questionsAsked[5][i].join(''), questionsAsked[6][i].join('')), 0));
	}
	return testLR;
}

function numpadText (colour) {
	var newText = svg.append("text")
					 .attr("opacity",0)
					 .transition()
					 .duration(updateTime)
					 .attr("opacity",normal)
					 .attr("x", windowAdjust+ indent+lineSize/9+(currentEntry.length-1)*numpadTextSize/2)
					 .attr("y", lineSize*3.2+indent)
					 .text(""+currentEntry[currentEntry.length-1])
					 .attr("font-size", numpadTextSize)
					 .attr("fill",colour)
					 .attr("class","numpadtxt")
					 .attr("id", "numPadText"+(currentEntry.length-1))
}

function field (change) {
//console.log(returnStringArray(currentEntry));
	switch (change) {
		case 1:
			// number added
			if (difficulty < questionLengths[0].length) {
				if (currentEntry.length <= thisSequence.length) {
					if (currentEntry[currentEntry.length-1]==thisSequence[(thisSequence.length-1)-(currentEntry.length-1)]) {
						numpadText("black");
					} else {
						numpadText("red");
					}
				} else {
						numpadText("red");
				}
			} else {
				numpadText("black");
			}
			break;
		case 2:
			// number deleted
			d3.select("#numPadText"+(currentEntry.length))
							  .transition()
							  .duration(updateTime)
							  .attr("opacity",0)
							  .remove();
			break;
		case 3:
			// submitted
			d3.selectAll('.numpadtxt')
							  .transition()
							  .duration(updateTime)
							  .attr("opacity",0)
							  .remove();
			break;
		default:
			console.warn("Unusual change in field function call");
	}
}
function drawNumPad (x,y,number) {
	var numOutline = svg.append("rect")
						 .attr("x", windowAdjust+ indent+x*boxWidth)
						 .attr("y", indent+lineSize*3.5+y*boxWidth)
						 .attr("width", boxWidth)
						 .attr("height", boxWidth)
						 .attr('class', 'numpad')
						 .attr("id","numberpad");
	var numVal = svg.append("text")
						 .attr("opacity", deactive)
						 .attr("x", windowAdjust+ indent+x*boxWidth+boxWidth/2)
						 .attr("y", indent+lineSize*3.5+y*boxWidth+boxWidth*9/12)
						 .attr("text-anchor","middle")
						 .text(""+number)
						 .attr('class', 'numberpadButtonText')
						 .attr("font-size", lineSize)
						 .attr("fill","green")
						 .attr("id","npButtonText"+number)
	var hitRect = svg.append("rect")
						 .attr("opacity", 0)
						 .attr("x", windowAdjust+ indent+x*boxWidth)
						 .attr("y", indent+lineSize*3.5+y*boxWidth)
						 .attr("width", boxWidth)
						 .attr("height", boxWidth)
						 .attr("id",""+number)
						 .on("mouseover", function() {
							/*var dMouseOver = new Date();
							var mtOutput = [dMouseOver.getTime(),x,type];
							console.log(mtOutput);
							questionsAsked[5][questionsAsked[5].length-1][0].push(mtOutput);*/
							if (sequenceFinished) {
								d3.select(this).transition()
											  .duration(updateTime)
											   .attr("opacity",0.25);
								d3.selectAll("#npButtonText"+number).transition()
											  .duration(updateTime)
											  .attr("opacity",highlight);
							}
						 })
						 .on("mouseout", function() {
							/*var dMouseOut = new Date();
							var mtOutput =[dMouseOut.getTime(),x,type];
							console.log(questionsAsked[1].length);
							questionsAsked[5][questionsAsked[5].length-1][1].push(mtOutput);*/
							if (sequenceFinished) {
								d3.select(this).transition()
											  .duration(updateTime)
											   .attr("opacity",0);
								d3.selectAll("#npButtonText"+number).transition()
											  .duration(updateTime)
											  .attr("opacity",normal);
							}
						 }) 
						 .on("click", function() {
						 //console.log("Clickety - "+number);
							if (sequenceFinished) {
								if (currentEntry.length < 12) {
									var dAnswered = new Date();
									questionsAsked[3][difficulty].push(dAnswered.getTime());
									questionsAsked[4][difficulty].push(number);
									currentEntry.push(number);
									field(1);
									//seed(dAnswered);
								}
							}
						 });
}

//Draw polygon
polyFunction = d3.svg.line()
             .x(function(d) { return d.x; })
             .y(function(d) { return d.y; })
             .interpolate("cardinal-closed");
curveFunction = d3.svg.line()
             .x(function(d) { return d.x; })
             .y(function(d) { return d.y; })
             .interpolate("cardinal-open");
curvedPolyFunction = d3.svg.line()
             .x(function(d) { return d.x; })
             .y(function(d) { return d.y; })
             .interpolate("basis-closed");
lineFunction = d3.svg.line()
             .x(function(d) { return d.x; })
             .y(function(d) { return d.y; })
             .interpolate("linear-closed");
             
function sequenceBoxShape (centx, centy, direction, gapSize) {
	var shape = [];
	var horizontal = boxWidth*direction*3/2;
	var vertical = boxWidth;
	var hgap = direction*gapSize
	// smoothness could be reduced significantly if points were concentrated proportionally to change.
	var smoothness = 70;
	shape.push({"x":windowAdjust+centx,"y":centy})
	shape.push({"x":windowAdjust+centx,"y":centy+vertical})
	
	for (var x = smoothness; x >= 0; x--) {
		shape.push({"x":windowAdjust+centx+horizontal-hgap*(Math.sqrt(1-Math.pow(2*x/smoothness-1,2))),"y":centy+vertical*x/smoothness});
	}
	
	shape.push({"x":windowAdjust+centx,"y":centy})
	
	return shape
}

function numPad () {
	var numOutline = svg.append("rect")
						 .attr("x", windowAdjust+ indent)
						 .attr("y", indent+lineSize*2+boxWidth*0.3)
						 .attr("width", 3*boxWidth)
						 .attr("height", boxWidth*.7)
						 .attr('class', 'numpad')
						 .attr("id","numberpad");
	/*var numOutline = svg.append("rect")
						 .attr("x", windowAdjust+ indent)
						 .attr("y", indent+lineSize*2-boxWidth*0.7)
						 .attr("width", 3*boxWidth)
						 .attr("height", boxWidth)
						 .attr('class', 'numpad')
						 .attr("id","numberpad");*/
	
	var sequenceBox = svg.append("path")
						.attr("d", lineFunction(sequenceBoxShape(indent, indent+lineSize*2-boxWidth*0.7, 1, 0)))
						.attr('class', 'sequenceBox')
						.attr("id", "numberpadBox1");
		
	var sequenceBox = svg.append("path")
						.attr("d", lineFunction(sequenceBoxShape(indent+3*boxWidth, indent+lineSize*2-boxWidth*0.7, -1, 0)))
						.attr('class', 'sequenceBox')
						.attr("id", "numberpadBox2");
	
	d3.selectAll("#numberpadBox1").transition()
										.duration(fade/2)
										.attr("d",lineFunction(sequenceBoxShape(indent, indent+lineSize*2-boxWidth*0.7, 1, lineSize/2)));
										
	d3.selectAll("#numberpadBox2").transition()
										.duration(fade/2)
										.attr("d",lineFunction(sequenceBoxShape(indent+3*boxWidth, indent+lineSize*2-boxWidth*0.7, -1, lineSize/2)));
	
	
	
	for (var x = 0; x < 3; x++) {
		for (var y = 0; y < 3; y++) {
			var number = x+(2-y)*3+1;
			drawNumPad(x,y,number);
		}
	}
	drawNumPad(1,3,0);
						 
	// Repeat (examples only)
	
	// A significant portion of the hitRect code for Repeat is duplicated in main() 
	// Duplicate code should be abstracted out to a function where logical.
	var numVal = svg.append("text")
						 .attr("opacity", deactive)
						 .attr("x", windowAdjust+ indent+3*boxWidth/2+1)
						 .attr("y", indent+lineSize*0.5)
						 .attr("text-anchor","middle")
						 .text("Repeat")
						 .attr('class', 'svgtxt')
						 .attr("font-size", lineSize)
						 .attr("fill","green")
						 .attr("id","repeat")
	var hitRect = svg.append("rect")
						 .attr("opacity", 0)
						 .attr("x", windowAdjust+ indent)
						 .attr("y", indent-lineSize/4)
						 .attr("width", boxWidth*3)
						 .attr("height", lineSize)
						 .attr("id","repeatHit")
						 .on("mouseover", function() {
						 	if (sequenceFinished) {
								d3.select(this).transition()
											  .duration(updateTime)
											  .attr("opacity",0.25);
								d3.selectAll("#repeat").transition()
											  .duration(updateTime)
											  .attr("opacity",highlight);
							}
						 })
						 .on("mouseout", function() {
						 	if (sequenceFinished) {
								d3.select(this).transition()
											  .duration(updateTime)
											  .attr("opacity",0);
								d3.selectAll("#repeat").transition()
											  .duration(updateTime)
											  .attr("opacity",normal);
							}
						 }) 
						 .on("click", function() {
						 //console.log("Clickety - "+number);
							if (sequenceFinished) {
							
								var dAnswered = new Date();
								questionsAsked[3][difficulty].push(dAnswered.getTime());
								questionsAsked[4][difficulty].push("repeatSequenceStarted");
								sequenceFinished = false;
								
								d3.select(this).transition()
											  .duration(updateTime)
											  .attr("opacity",0);
								d3.select("#submit").transition()
													.duration(updateTime/2)
													.attr("opacity",deactive);
								d3.select("#delete").transition()
													.duration(updateTime/2)
													.attr("opacity",deactive);
								d3.selectAll(".numberpadButtonText").transition()
												  .duration(updateTime/2)
												  .attr("opacity",deactive);
								setTimeout(
									function () {
										d3.selectAll("#numberpadBox1").transition()
																			.duration(fade/2)
																			.attr("d",lineFunction(sequenceBoxShape(indent, indent+lineSize*2-boxWidth*0.7, 1, lineSize/2)));
											
										d3.selectAll("#numberpadBox2").transition()
																			.duration(fade/2)
																			.attr("d",lineFunction(sequenceBoxShape(indent+3*boxWidth, indent+lineSize*2-boxWidth*0.7, -1, lineSize/2)));
									},
									updateTime*2
								)
								setTimeout(
									function (){ 
										var number = svg.append('g')
														.selectAll('text')
														.data(thisSequence);
										//
										number.enter().append('text')
													  .style('opacity', 0)
													  .attr("text-anchor","middle")
													  .attr("x", windowAdjust+ indent + 3*boxWidth/2)
													  .attr("y", lineSize*2+indent)
													  .text(function(d) {return d;})
													  .attr("class", "svgtxt")
													  .attr("font-size", lineSize)
													  .attr("fill","blue")
													  .attr("id", function(d) {return "valText"+d;})
							  
										//
										number.transition()
											  .style('opacity', 1)
											  .delay(function(d,i) { return i * fade; })
											  .duration(fade/2)
											  .transition()
											  .duration(fade/2)
											  .style('opacity', 0)
											  .remove();
									},
									delay+updateTime*2
								);
								//
								setTimeout(
									function(){
										sequenceFinished = true; 
										var dAnswered = new Date();
										questionsAsked[3][difficulty].push(dAnswered.getTime());
										questionsAsked[4][difficulty].push("repeatSequenceFinished");
										console.log("Repeat Sequence Finished"); 
										d3.selectAll("#numberpadBox1").transition()
																	.duration(fade/2)
																	.attr("d",lineFunction(sequenceBoxShape(indent, indent+lineSize*2-boxWidth*0.7, 1, 0)))
											
										d3.selectAll("#numberpadBox2").transition()
																	.duration(fade/2)
																	.attr("d",lineFunction(sequenceBoxShape(indent+3*boxWidth, indent+lineSize*2-boxWidth*0.7, -1, -1, 0)))
										d3.selectAll(".numberpadButtonText").transition()
																  .duration(updateTime)
																  .attr("opacity",normal);
										d3.select("#submit").transition()
																  .duration(updateTime)
																  .attr("opacity",normal);
										d3.select("#delete").transition()
																  .duration(updateTime)
																  .attr("opacity",normal);
										if (difficulty < questionLengths[0].length) {
											d3.select("#repeat").transition()
															.duration(updateTime)
															.attr("opacity", normal)
										}
									},
									fade*(item-0.1)+delay+updateTime*2
								);
							}
							
						 });
	
	// Delete
	var answer = svg.append("image")
				 	.attr("opacity", deactive)
					.attr("xlink:href",pathPrefix+"/delete.jpg")
					.attr("x", windowAdjust+ indent+lineSize/5)
					.attr("y", indent+lineSize*3.5+3*boxWidth+lineSize/5)
					.attr("width", boxWidth-lineSize/2.5)
					.attr("height", boxWidth-lineSize/2.5)
					.attr("id", "delete");
	var hitRect = svg.append("rect")
				 .attr("opacity", 0)
				 .attr("x", windowAdjust+ indent-lineSize/20)
				 .attr("y", indent+lineSize*3.5+3*boxWidth)
				 .attr("width", boxWidth+lineSize/20)
				 .attr("height", boxWidth+lineSize/20)
				 .on("mouseover", function() {
					if (sequenceFinished && currentEntry.length > 0) {
						d3.select("#delete").transition()
									   .attr("opacity",highlight);
					}
				 })
				 .on("mouseout", function() {
					if (sequenceFinished) {
						d3.select("#delete").transition()
									   .attr("opacity",normal);
					}
				 })
				 .on("click", function() {
				 //console.log("Clickety - Delete");
					if (sequenceFinished) {
						d3.select("#delete").transition()
									   .attr("opacity",normal);
						var dAnswered = new Date();
						questionsAsked[3][difficulty].push(dAnswered.getTime());
						questionsAsked[4][difficulty].push("Delete");
						currentEntry.pop();
						field(2);
					}
				 });
	
	
	// Submit			 
	var answer = svg.append("image")
				    .attr("opacity", deactive)
					.attr("xlink:href",pathPrefix+"/Tick.jpg")
					.attr("x", windowAdjust+ indent+2*boxWidth+lineSize/20)
					.attr("y", indent+lineSize*3.5+3*boxWidth+lineSize/20)
					.attr("width", boxWidth-lineSize/10)
					.attr("height", boxWidth-lineSize/10)
					.attr("id", "submit");
	var hitRect = svg.append("rect")
				 .attr("opacity", 0)
					.attr("x", windowAdjust+ indent+2*boxWidth)
					.attr("y", indent+lineSize*3.5+3*boxWidth)
					.attr("width", boxWidth+lineSize/20)
					.attr("height", boxWidth+lineSize/20)				 
					.on("mouseover", function() {
						if (sequenceFinished) {
						var lev = levenshtein(currentEntry.join(''), questionsAsked[6][questionsAsked[6].length-1].join(''));
						var leng = questionsAsked[6][questionsAsked[6].length-1].length;
						console.log("levenshtein score: "+lev);
						console.log("Item length: "+leng);
						console.log("Final score: "+lev/leng)
							if ((difficulty < questionLengths[0].length && (levenshtein(currentEntry.join(''), questionsAsked[6][questionsAsked[6].length-1].join('')) == 0)) || difficulty >= questionLengths[0].length) {
								d3.select("#submit").transition()
											   .attr("opacity",highlight);
							}
						}
				 	})
					.on("mouseout", function() {
						if (sequenceFinished) {
							d3.select("#submit").transition()
										   .attr("opacity",normal);
						}
				 	})

				 .on("click", function() {
				 //console.log("Clickety - Submit");
					if (sequenceFinished) {
						if (difficulty < questionLengths[0].length && (levenshtein(currentEntry.join(''), questionsAsked[6][questionsAsked[6].length-1].join('')) == 0)) {
							sequenceFinished = false;
							var dAnswered = new Date();
							questionsAsked[3][difficulty].push(dAnswered.getTime());
							questionsAsked[4][difficulty].push("Submit");						
							difficulty++;
							questionsAsked[3].push([]);
							questionsAsked[4].push([]);
							questionsAsked[5].push(currentEntry);
							scoreTest();
							currentEntry = [];
					
							d3.select("#submit").transition()
												.duration(updateTime/2)
												.attr("opacity",deactive);
							d3.select("#delete").transition()
												.duration(updateTime/2)
												.attr("opacity",deactive);
							d3.selectAll(".numberpadButtonText").transition()
											  .duration(updateTime/2)
											  .attr("opacity",deactive);
							main();
							//seed(dAnswered);
						} else if (difficulty >= questionLengths[0].length) {
							sequenceFinished = false;
							var dAnswered = new Date();
							questionsAsked[3][difficulty].push(dAnswered.getTime());
							questionsAsked[4][difficulty].push("Submit");						
							difficulty++;
							questionsAsked[3].push([]);
							questionsAsked[4].push([]);
							questionsAsked[5].push(currentEntry);
							scoreTest();
							currentEntry = [];
					
							d3.select("#submit").transition()
												.duration(updateTime/2)
												.attr("opacity",deactive);
							d3.select("#delete").transition()
												.duration(updateTime/2)
												.attr("opacity",deactive);
							d3.selectAll(".numberpadButtonText").transition()
											  .duration(updateTime/2)
											  .attr("opacity",deactive);
							main();
							//seed(dAnswered);
						}
						//
						if (difficulty == questionLengths[0].length) {
							console.log("Go Black!")
							// no longer examples
							d3.selectAll("#numberpad").style("stroke", "green")
										  .attr("fill", "green")
										  .transition()
										  .duration(updateTime*2)
										  .style("stroke","black")
										  .attr("fill", "black");
									
							d3.selectAll(".numberpadButtonText").style("stroke", "green")
										  .attr("fill", "green")
										  .transition()
										  .duration(updateTime*2)
										  .style("stroke","black")
										  .attr("fill", "black");
										  
							d3.selectAll(".sequenceBox").attr("class", "sequenceBox")
										  .transition()
										  .duration(updateTime*2)
										  .attr("class", "sequenceBox2");
							d3.select("#repeat").transition()
											.duration(updateTime)
										  	.attr("opacity", 0)
										  	.remove();
							d3.select("#repeatHit").transition()
											.duration(updateTime)
										  	.attr("opacity", 0)
										  	.remove();
						}
					}
				 });
}
function wrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = returnStringArray(questionsAsked).split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", windowAdjust+ x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", windowAdjust+ x)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}
/*function runScript() {
  $('#thirdpartyCanvas').remove();
main(); };*/
$(document).ready(main());
numPad();
function main() {
	var dStartSeq = new Date();
	questionsAsked[1].push(dStartSeq.getTime());
	//
	if (endCriteria || difficulty > questionLengths[0].length + questionLengths[1].length-1) {
		console.log("finished!");
		d3.selectAll("svg > *").transition().duration(updateTime*3).attr("opacity",0).remove();
		questionsAsked[3].pop();
		questionsAsked[4].pop();
		var finishText = svg.append("text")
							.attr("x", windowAdjust-finishAdjust+ indent/2)
							.attr("y", indent*1.5)
							.text("Thank you for completing the test.")
							.attr("font-size", lineSize+"px")
							.attr("fill","black")
							.attr("id", "questionText");
		console.log(lengthRemembered());
		console.log(returnStringArray(lengthRemembered()));
		function qlr(x) {
			var val = 0;
			if (x < questionLengths[0].length) {
				val = questionLengths[0][x];
			} else {
				val = questionLengths[1][x-questionLengths[0].length];
			}
			return val;
		}
		var finishText = svg.append("text")
							.attr("x", windowAdjust-finishAdjust+ indent)
							.attr("y", lineSize*1.6+indent)
							.text("Length:")
							.attr("font-size", "12px")
							.attr("fill","black")
							.attr("id", "questionText");
		var finishText = svg.append("text")
							.attr("x", windowAdjust-finishAdjust+ indent)
							.attr("y", lineSize*2+indent)
							.text("Score:")
							.attr("font-size", "12px")
							.attr("fill","black")
							.attr("id", "questionText");
		var finishText = svg.append("text")
							.attr("x", windowAdjust-finishAdjust+ indent)
							.attr("y", lineSize*2.4+indent)
							.text("Percentage:")
							.attr("font-size", "12px")
							.attr("fill","black")
							.attr("id", "questionText");
		var lenRem = lengthRemembered();
		for (var x = 0; x < lenRem.length; x++) {
			var finishText = svg.append("text")
								.attr("x", windowAdjust-finishAdjust+ indent+100+35*x)
								.attr("y", lineSize*1.6+indent)
								.attr("text-anchor","middle")
								.text(qlr(x))
								.attr("font-size", "12px")
								.attr("fill","black")
								.attr("id", "questionText");
			var finishText = svg.append("text")
								.attr("x", windowAdjust-finishAdjust+ indent+100+35*x)
								.attr("y", lineSize*2+indent)
								.attr("text-anchor","middle")
								.text(lenRem[x])
								.attr("font-size", "12px")
								.attr("fill","black")
								.attr("id", "questionText");
			var finishText = svg.append("text")
								.attr("x", windowAdjust-finishAdjust+ indent+100+35*x)
								.attr("y", lineSize*2.4+indent)
								.attr("text-anchor","middle")
								.text(Math.round(100*lenRem[x]/qlr(x))+"%")
								.attr("font-size", "12px")
								.attr("fill","black")
								.attr("id", "questionText");
			// + " :: Total: " + lengthRemembered().reduce(function(a,b) {return a+b;}, 0)+" out of "+ 
			//(...questionLengths[1].reduce(function(a,b) {return a+b;}, 0))
		}// out of a possible ... 
		function totalPossible () {
			var sum = 0;
			for (var i = 0; i < questionsAsked[6].length; i++) {
				sum += questionsAsked[6][i].length;
			}
			return sum;
		}
		var finishText = svg.append("text")
							.attr("x", windowAdjust-finishAdjust+ indent)
							.attr("y", lineSize*3+indent)
							.text("Completed "+lenRem.length+" items, with an average accuracy of "+Math.round(lenRem.reduce(function(a,b) {return a+b;}, 0)/totalPossible ()*1000)/10+"%")//with a total score of "+ lenRem.reduce(function(a,b) {return a+b;}, 0) + ", which is "+ Math.round(lenRem.reduce(function(a,b) {return a+b;}, 0)/totalPossible ()*1000)/10+"% of "+totalPossible()+" (the combined sequence lengths).")
							.attr("font-size", "16px")
							.attr("fill","black")
							.attr("id", "questionText");
							
							
		var finishText = svg.append("text")
							.attr("x", windowAdjust-finishAdjust+ indent/2)
							.attr("y", lineSize*7+indent)
							.text("Please wait for the test results to download to your local machine.")
							.attr("font-size", lineSize+"px")
							.attr("fill","black")
							.attr("id", "questionText");
		/*var finishText = svg.append("text")
							.attr("class","node")
							.attr("x", windowAdjust+ indent/2)
							.attr("y", lineSize+indent)
							.text(returnStringArray(questionsAsked))
							.attr("font-size", "10px")
							.attr("fill","black")
							.attr("id", "questionText")
							.call(wrap,(w-indent))*/
		//console.log(questionsAsked);
		dataToSubmit = {"version" : "v0.1.0", "startTime" : questionsAsked[0],
        "onStart" : questionsAsked[1],
        "onSequenceFinished" : questionsAsked[2],
        "buttonPushTimes" : questionsAsked[3],
        "buttonPushes" : questionsAsked[4],
        "answerSubmited" : questionsAsked[5],
        "correctAnswer" : questionsAsked[6]};
        var dataToDownload = "{version : v0.1.1, startTime : "+ questionsAsked[0]+", onStart : "+ questionsAsked[1]+", onSequenceFinished : "+ questionsAsked[2]+", buttonPushTimes :"+ questionsAsked[3]+", buttonPushes : "+ questionsAsked[4]+", answerSubmited : "+ questionsAsked[5]+", correctAnswer : "+ questionsAsked[6]+"}";

		console.log(dataToSubmit);
		download("data:\n{"+dataToDownload+"}", questionsAsked[0]);
		// for true colours version see other file
	} else {
		//
		if (difficulty < questionLengths[0].length) {
			item = questionLengths[0][difficulty];
			console.log("Example Item");
		} else {
			item = questionLengths[1][difficulty-questionLengths[0].length];
			console.log("Normal Item");
		}
		//
		setTimeout(
			function () {
				d3.selectAll("#numberpadBox1").transition()
													.duration(fade/2)
													.attr("d",lineFunction(sequenceBoxShape(indent, indent+lineSize*2-boxWidth*0.7, 1, lineSize/2)));
											
				d3.selectAll("#numberpadBox2").transition()
													.duration(fade/2)
													.attr("d",lineFunction(sequenceBoxShape(indent+3*boxWidth, indent+lineSize*2-boxWidth*0.7, -1, lineSize/2)));
			},
			updateTime*2
		)
		setTimeout(
			function (){ 
				thisSequence = generateSequence(item);
				var number = svg.append('g')
								.selectAll('text')
								.data(thisSequence);
				//
				number.enter().append('text')
							  .style('opacity', 0)
							  .attr("text-anchor","middle")
							  .attr("x", windowAdjust+ indent + 3*boxWidth/2)
							  .attr("y", lineSize*2+indent)
							  .text(function(d) {return d;})
							  .attr("class", "svgtxt")
							  .attr("font-size", lineSize)
							  .attr("fill","blue")
							  .attr("id", function(d) {return "valText"+d;})
							  
				//
				number.transition()
					  .style('opacity', 1)
					  .delay(function(d,i) { return i * fade; })
					  .duration(fade/2)
					  .transition()
					  .duration(fade/2)
					  .style('opacity', 0)
					  .remove();
			},
			delay+updateTime*2
		);
		//
		setTimeout(
			function(){
				sequenceFinished = true; 
				var dStartItem = new Date();
				questionsAsked[2].push(dStartItem.getTime());
				console.log("Sequence Finished"); 
				d3.selectAll("#numberpadBox1").transition()
											.duration(fade/2)
											.attr("d",lineFunction(sequenceBoxShape(indent, indent+lineSize*2-boxWidth*0.7, 1, 0)))
											
				d3.selectAll("#numberpadBox2").transition()
											.duration(fade/2)
											.attr("d",lineFunction(sequenceBoxShape(indent+3*boxWidth, indent+lineSize*2-boxWidth*0.7, -1, -1, 0)))
				d3.selectAll(".numberpadButtonText").transition()
										  .duration(updateTime)
										  .attr("opacity",normal);
				d3.select("#submit").transition()
										  .duration(updateTime)
										  .attr("opacity",normal);
				d3.select("#delete").transition()
										  .duration(updateTime)
										  .attr("opacity",normal);
				if (difficulty < questionLengths[0].length) {
					d3.select("#repeat").transition()
									.duration(updateTime)
								  	.attr("opacity", normal)
				}
			},
			fade*(item-0.1)+delay+updateTime*2
		);
		//
		currentEntry = [];
		field(3);
		/*
		allQuestions.push("result");
		main();*/
	}
}