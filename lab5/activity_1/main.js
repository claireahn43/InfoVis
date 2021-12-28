// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    // Get current value of select element
    var category = select.options[select.selectedIndex].value;
    // Update chart with the selected category of letters
    updateChart(category);
}

// recall that when data is loaded into memory, numbers are loaded as strings
// this function helps convert numbers into string during data preprocessing
function dataPreprocessor(row) {
    return {
        letter: row.letter,
        frequency: +row.frequency
    };
}

var svg = d3.select('svg');

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Compute the spacing for bar bands based on all 26 letters
var barBand = chartHeight / 26;
var barHeight = barBand * 0.7;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// A map with arrays for each category of letter sets
var lettersMap = {
    'all-letters': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    'only-consonants': 'BCDFGHJKLMNPQRSTVWXZ'.split(''),
    'only-vowels': 'AEIOUY'.split('')
};

var letters;
var widthDomain = [];
var widthScale
d3.csv('letter_freq.csv', dataPreprocessor).then(function(dataset) {
    // Create global variables here and intialize the chart

    // **** Your JavaScript code goes here ****
    letters = dataset;
    
    dataset.forEach(function(d, i){
        widthDomain[i] = d.frequency;
    })
    widthScale = d3.scaleLinear()
        .domain([0, 100*(d3.max(widthDomain))])
        .range([0, chartWidth])
    // Update the chart for all letters to initialize
    updateChart('all-letters');
});


function updateChart(filterKey) {
    // Create a filtered array of letters based on the filterKey
    var filteredLetters = letters.filter(function(d){
        return lettersMap[filterKey].indexOf(d.letter) >= 0;
    });


    // **** Draw and Update your chart here ****
    var xAxisTop = d3.axisTop(widthScale).tickFormat(function(d) {return d + '%'})
    var xAxisBottom = d3.axisBottom(widthScale).tickFormat(function(d) {return d + '%'})
    xAxisTop.ticks(6)
    xAxisBottom.ticks(6)

    chartG.append('g')
        .attr('class', 'axis-label')
        .append('text')
        .text('Letter Frequency (%)')
        .attr('transform', 'translate('+[chartWidth/2, -30]+')')
    chartG.append('g')
        .attr('class', 'top x axis-label')
        .attr('transform', 'translate('+[0, -5]+')')
        .call(xAxisTop)
    chartG.append('g')
        .attr('class', 'bottom x axis-label')
        .attr('transform', 'translate(' +[0, chartHeight]+ ')')
        .call(xAxisBottom)

    var filteredLet = chartG.selectAll('.filteredLetter')
        .data(filteredLetters)
    var filteredEnter = filteredLet.enter()
        .append('g')
        .attr('class', 'filteredLetter')
    filteredEnter.merge(filteredLet)
        .attr('transform', function(d,i) {
                return 'translate(' +[0, i * barBand]+ ')';
            });
    filteredEnter.append('rect')
        .attr('width', function(d){return (100 * d.frequency * chartWidth) / (100*(d3.max(widthDomain)))})
        .attr('height', barHeight)
    filteredEnter.append('text')
        .attr('transform', 'translate(' +[-20, barHeight]+ ')')
        .text(function(d){return d.letter})
    filteredLet.exit().remove();
}

// Remember code outside of the data callback function will run before the data loads