function xChanged() {
    var xaxisSelect = d3.select('#xaxisSelector').node();
    // Get current value of select element for x axis 
    xAxisSel = xaxisSelect.options[xaxisSelect.selectedIndex].value;
    // Update chart with the selected category of letters
    //clear chart and redraw
    d3.select('svg > *').remove()
    updateChart(xAxisSel, yAxisSel);
    drawHistogram();
}
function yChanged() {
    var yaxisSelect = d3.select('#yaxisSelector').node();
    // Get current value of select element for y axis
    yAxisSel = yaxisSelect.options[yaxisSelect.selectedIndex].value;
    // Update chart with the selected category of letters
    //clear chart and redraw
    d3.select('svg > *').remove()
    updateChart(xAxisSel, yAxisSel);
    drawHistogram();
}

var svg = d3.select('svg')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
var padding = {t: 40, r: 40, b: 40, l: 50};
var cellPadding = 10;

var cellWidth = (svgWidth - padding.l*3)/2;
var cellHeight = svgHeight - padding.t - padding.b;

var dataAttributes = ['economy (mpg)', 'cylinders', 'displacement (cc)', 'power (hp)', 'weight (lb)', '0-60 mph (s)', 'year'];

var xScale = d3.scaleLinear().range([0, cellWidth - cellPadding]);
var yScale = d3.scaleLinear().range([cellHeight - cellPadding, 0]);
// axes that are rendered already for you
var xScaleHist;
var yScaleHist;
var bins;
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
var extentByAttribute = {};
var xAxisSel = 'cylinders';
var yAxisSel = 'power (hp)';
var cars;
var count = [];
var brushCell;
var brushCell2;
var histogramG;
var barBand;
var lengthList = [];
var visible;
var cylindersList = [];
var valueList = [];

//store cylinder values
for (var i = 0; i < 6; i++) {
    valueList[i] = i + 3;
}
//store the heights for each cylinder value
for (var i = 0; i < 10; i++) {
    if (i == 3) {
        lengthList[i] = 4;
    } else if (i == 4) {
        lengthList[i] = 207;
    } else if (i == 5) {
        lengthList[i] = 3;
    } else if (i == 6) {
        lengthList[i] = 84;
    } else if (i == 7) {
        lengthList[i] = 0;
    } else if (i == 8) {
        lengthList[i] = 108;
    } else {
        lengthList[i] = 0;
    }
}

//for scatterplot
var brush1 = d3.brush()
    .extent([[0,0], [cellWidth - cellPadding, cellHeight - cellPadding]])
    .on("start", brushstart1)
    .on("brush", brushmove1)
    .on("end", brushend1);

//for bar graph
var brush2 = d3.brush()
    .extent([[0,0], [cellWidth - cellPadding, cellHeight - cellPadding]])
    .on("start", brushstart2)
    .on("brush", brushmove2)
    .on("end", brushend2);

//store data and store cylinder values and initiate charts
d3.csv('cars.csv', dataPreprocessor).then(function(dataset) {
    cars = dataset
    dataset.forEach(function(d, i) {
        count[i] = d['cylinders'];
    })
    updateChart('cylinders', 'power (hp)')
    drawHistogram();
})

//draw and update scatterplot
function updateChart(xFilter, yFilter) {
        //clear chart
        d3.select('svg > *').remove()

        //save min and max values for each data attribute
        dataAttributes.forEach(function(attribute){
            extentByAttribute[attribute] = d3.extent(cars, function(d){
                return d[attribute];
            });
        });
        
        var xAxis = d3.axisBottom(xScale).ticks(6).tickSize(-cellHeight + cellPadding, 0, 0);
        var yAxis = d3.axisLeft(yScale).ticks(6).tickSize(-cellWidth + cellPadding, 0, 0);
        var chartG = svg.append('g')
            .attr('transform', 'translate('+[padding.l, padding.t]+')');
        //scales for scatterplot 
        xScale.domain(extentByAttribute[xFilter])
        yScale.domain(extentByAttribute[yFilter])

        chartG.append('rect')
            .attr('class', 'frame')
            .attr('width', cellWidth - cellPadding)
            .attr('height', cellHeight - cellPadding);
        chartG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' +[0, cellHeight - cellPadding]+ ')')
            .call(xAxis)
            .append('text')
            .text(xFilter)
            .attr('class', 'axis-label')
            .attr('transform', 'translate('+[cellWidth / 2, 30]+')');        
        chartG.append('g')
            .attr('class','y axis')
            .call(yAxis)
            .append('text')
            .text(yFilter)
            .attr('class', 'axis-label')
            .attr('transform', 'translate('+[-35, cellHeight / 2]+')rotate(270)');
        var filtered = chartG.selectAll('.dot')
            .data(cars, function(d){
                return d.name +'-'+d.year+'-'+d.cylinders; // Create a unique id for the car
            });
        var filteredEnter = filtered.enter()
            .append('g')
            .attr('class', 'dot');
        filteredEnter.merge(filtered)
            .attr('transform', function(d,i) {
                return 'translate('+[xScale(d[xFilter]), yScale(d[yFilter])]+')';
            });
        filteredEnter.append('circle')
            .attr('class', 'dot')
            .style("fill", function(d) { return colorScale(d.cylinders); })
            .attr('r', 4)
        filtered.exit().remove(); 
        chartG.append('g')
            .attr('class', 'brush')
            .call(brush1);
}

//draw histogram
function drawHistogram() {
    barBand = (cellWidth-cellPadding) / 6;
    xScaleHist = d3.scaleLinear()
        .domain([3,9])
        .range([0, cellWidth - cellPadding])
    var xGrid = d3.axisTop(xScaleHist)
        .tickSize(-cellHeight + cellPadding, 0, 0)
        .ticks(6)
        .tickFormat('')
    var xAxisHist = d3.axisBottom(xScaleHist).ticks(6)
        .tickSize(0,0,0)
        .tickValues(valueList) //only include from 3 to 8

    var histogram = d3.histogram()
        .domain([3,9])
        .thresholds(xScaleHist.ticks(6))
    bins = histogram(count)
    histogramG = svg.append('g')
        .attr('transform', 'translate('+[padding.l + 70 + cellWidth, padding.t]+')');
    histogramG.append('g')
        .attr('class', 'x axis')
        .call(xGrid)
    histogramG.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(' +[cellWidth/12, cellHeight - cellPadding]+ ')')
        .call(xAxisHist)
        .append('text')
        .text('cylinders')
        .attr('class', 'axis-label')
        .attr('transform', 'translate('+[cellWidth / 2, 30]+')');        
    yScaleHist = d3.scaleLinear().range([cellHeight - cellPadding,0])
        .domain([0, d3.max(bins, function(d){return d.length})])
    var yAxisHist = d3.axisLeft(yScaleHist).ticks(6).tickSize(-cellWidth + cellPadding, 0, 0);

    histogramG.append('g')
        .attr('class','y axis')
        .call(yAxisHist)
        .append('text')
        .text('count')
        .attr('class', 'axis-label')
        .attr('transform', 'translate('+[-25, cellHeight / 2]+')rotate(270)');

    var filteredHist = histogramG.selectAll('.bar')
        .data(bins);
    var filteredEnterHist = filteredHist.enter()
        .append('g')
        .attr('class', 'bar');
    filteredEnterHist.merge(filteredHist)
        .attr('transform', function(d,i) {
                return 'translate(' +[i * barBand, 0]+ ')';
            });
    filteredEnterHist.append('rect')
        .attr('class', 'bar')
        .style("fill", function(d) { return colorScale(d.x0)})
        .attr('x', function(d) {return xScaleHist(d.x1)-xScaleHist(d.x0)-barBand})
        .attr('y', function(d) {return yScaleHist(d.length)})
        .attr("width", barBand)
        .attr("height", function(d) {
            return cellHeight - cellPadding - yScaleHist(d.length);
        })
    filteredHist.exit().remove(); 
    histogramG.append('g')
            .attr('class', 'brush')
            .call(brush2);
}

// ********* Your event listener functions go here *********//
function brushstart1(cell) {
    svg.selectAll('.bar').classed('hidden', false);
    // cell is the SplomCell object
    // Check if this g element is different than the previous brush
    if(brushCell !== this) {

        // Clear the old brush
        cylindersList  = []

        d3.brush().move(d3.select(brushCell), null);

        // Update the global scales for the subsequent brushmove events
        xScale.domain(extentByAttribute[xAxisSel]);
        yScale.domain(extentByAttribute[yAxisSel]);

        // Save the state of this g element as having an active brush
        brushCell = this;
    }
}

function brushmove1(cell) {
    // cell is the SplomCell object

    // Get the extent or bounding box of the brush event, this is a 2x2 array
    var e = d3.event.selection;
    visible = false;
    cylindersList = [];
    if(e) {

        // Select all .dot circles, and add the "hidden" class if the data for that circle
        // lies outside of the brush-filter applied for this SplomCells x and y attributes
        svg.selectAll(".dot")
            .classed("hidden", function(g, i){
                if (!(e[0][0] > xScale(g[xAxisSel]) || xScale(g[xAxisSel]) > e[1][0]
                    || e[0][1] > yScale(g[yAxisSel]) || yScale(g[yAxisSel]) > e[1][1])) {
                cylindersList[i] = g['cylinders'];
                }

                return e[0][0] > xScale(g[xAxisSel]) || xScale(g[xAxisSel]) > e[1][0]
                    || e[0][1] > yScale(g[yAxisSel]) || yScale(g[yAxisSel]) > e[1][1];
            })
        svg.selectAll(".bar")
            .classed("hidden", function(d){
                visible = false;
                cylindersList.forEach(function(f,i) {
                    if (d.x0 == cylindersList[i]) {
                        visible = true;
                        }
                    }
                )
                return !visible
            })
    }
}

function brushend1() {
    // If there is no longer an extent or bounding box then the brush has been removed
    if(!d3.event.selection) {
        // Bring back all hidden .dot elements
        svg.selectAll('.hidden').classed('hidden', false);
        // Return the state of the active brushCell to be undefined
        cylindersList = [];
        brushCell = undefined;
    }
}

function brushstart2(cell) {
    // cell is the SplomCell object
    // Check if this g element is different than the previous brush
    if(brushCell !== this) {

        // Clear the old brush
        d3.brush().move(d3.select(brushCell), null);

        // Update the global scales for the subsequent brushmove events
        xScaleHist.domain([3,9]);
        yScaleHist.domain([0, d3.max(bins, function(d){return d.length})]);

        // Save the state of this g element as having an active brush
        brushCell = this;
    }
}

function brushmove2(cell) {
    // cell is the SplomCell object

    // Get the extent or bounding box of the brush event, this is a 2x2 array
    var e = d3.event.selection;
    if(e) {

        // Select all .dot circles, and add the "hidden" class if the data for that circle
        // lies outside of the brush-filter applied for this SplomCells x and y attributes
        svg.selectAll(".dot")
            .classed("hidden", function(d){
                return e[0][0] > xScaleHist(d['cylinders'] + 0.99) || xScaleHist(d['cylinders']) > e[1][0]
                || yScaleHist(lengthList[d['cylinders']]) > e[1][1]
            })
        svg.selectAll(".bar")
            .classed("hidden", function(d){
                return e[0][0] > xScaleHist(d.x1) || xScaleHist(d.x0) > e[1][0]
                || yScaleHist(d.length) > e[1][1]
            })
        
    }
}

function brushend2() {
    // If there is no longer an extent or bounding box then the brush has been removed
    if(!d3.event.selection) {
        // Bring back all hidden .dot elements
        svg.selectAll('.hidden').classed('hidden', false);
        // Return the state of the active brushCell to be undefined
        brushCell = undefined;
    }
}


// Remember code outside of the data callback function will run before the data loads

function dataPreprocessor(row) {
    return {
        'name': row['name'],
        'economy (mpg)': +row['economy (mpg)'],
        'cylinders': +row['cylinders'],
        'displacement (cc)': +row['displacement (cc)'],
        'power (hp)': +row['power (hp)'],
        'weight (lb)': +row['weight (lb)'],
        '0-60 mph (s)': +row['0-60 mph (s)'],
        'year': +row['year']
    };
}
