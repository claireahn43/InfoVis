//get rid of bar charts every time filters change
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>"+d['movie_title'] + d['content_rating']+"</h5>";
    });

function xChanged() {
    var xaxisSelect = d3.select('#xaxisSelector').node();
    // Get current value of select element for x axis 
    xAxisSel = xaxisSelect.options[xaxisSelect.selectedIndex].value;
    //clear chart and redraw
    d3.select('svg > *').remove()
    d3.select('#barG').remove()
    updateChart(xAxisSel, yAxisSel, yearSel);
}
function yChanged() {
    var yaxisSelect = d3.select('#yaxisSelector').node();
    // Get current value of select element for y axis
    yAxisSel = yaxisSelect.options[yaxisSelect.selectedIndex].value;
    //clear chart and redraw
    d3.select('svg > *').remove()
    d3.select('#barG').remove()
    updateChart(xAxisSel, yAxisSel, yearSel);
}
function yearChanged() {
    var yearSelect = d3.select('#yearSelector').node();
    // Get current value of select element for x axis 
    yearSel = yearSelect.options[yearSelect.selectedIndex].value;
    //clear chart and redraw
    d3.select('svg > *').remove()
    d3.select('#barG').remove()
    updateChart(xAxisSel, yAxisSel, yearSel);
}

var svg = d3.select('svg')
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');
var padding = {t: 40, r: 40, b: 40, l: 80};
var cellPadding = 10;
var xAxisSel = 'duration';
var yAxisSel = 'imdb_score';
var yearSel = 'All'
svg.call(toolTip);

var cellWidth = (svgWidth - padding.l*3)/2;
var cellHeight = svgHeight - padding.t - padding.b;

var dataAttributes = ['duration', 'aspect_ratio', 'imdb_score', 'budget', 'gross', 'num_user_for_reviews', 'facenumber_in_poster', 'num_voted_users', 'title_year'];

var xScale = d3.scaleLinear().range([0, cellWidth - cellPadding]);
var yScale = d3.scaleLinear().range([cellHeight - cellPadding, 0]);
// axes that are rendered already for you
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);
var movies;
var colorList = {2010: colorScale('2010'), 2011: colorScale('2011'), 2012: colorScale('2012'), 2013: colorScale('2013'), 2014: colorScale('2014'), 2015: colorScale('2015'), 2016: colorScale('2016')}
var years = ['2010', '2011', '2012', '2013', '2014', '2015', '2016']

//store dataset
d3.csv('movies.csv', dataPreprocessor).then(function(dataset) {
    movies = dataset
    updateChart('duration', 'imdb_score', 'All')
})

//draw and update scatterplot
function updateChart(xFilter, yFilter, yearFilter) {
        //clear chart
        d3.select('svg > *').remove()

        var xAxis = d3.axisBottom(xScale).ticks(6).tickSize(5, 0, 0);
        var yAxis = d3.axisLeft(yScale).ticks(6).tickSize(5, 0, 0);
        var chartG = svg.append('g')
            .attr('transform', 'translate('+[padding.l, padding.t]+')');

        //scales for scatterplot 
        xScale.domain([0, d3.max(movies, function(d) {return +d[xAxisSel]})])
        yScale.domain([0, d3.max(movies, function(d) {return +d[yAxisSel]})])

        chartG.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(' +[0, cellHeight - cellPadding]+ ')')
            .call(xAxis)
        chartG.append('g')
            .attr('class','y axis')
            .call(yAxis)
        var filteredYear = movies.filter(function(d,i) {
            if (yearFilter != 'All') {
                return (movies[i].title_year == yearFilter)
            } else {
                return movies[i]
            }
        })
        var filtered = chartG.selectAll('.dot')
            .data(filteredYear, function(d){
            return d.movie_title +'-'+d.title_year+'-'+d.gross; // Create a unique id for the movie
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
            .style("fill", function(d) { return colorScale(d.title_year); })
            .attr('r', 4)
        //show tooltip on hovering
        filteredEnter.on('mouseover', toolTip.show)
            .on('mouseout', toolTip.hide);
        //draw bar chart when clicked
        filteredEnter.on("click", function(d) {
            drawBarChart(d)
        })
        //remove bar chart when double clicked
        filteredEnter.on("dblclick", function(d) {
            d3.select('#barG').remove()
        })
        filtered.exit().remove(); 
        
        //draw legend
        var colorLegendG = svg.append('g')
            .attr('transform', 'translate('+[padding.l + 100 + cellWidth, padding.t]+')')
        colorLegendG.append('text')
            .attr('transform', 'translate('+[-5, -15]+')')
            .text('Movie Year')
            .attr('text-decoration', 'underline')
        colorLegendG.selectAll('colorDots')
            .data(years)
            .enter()
            .append('rect')
            .attr('class', 'colorRect')
            .style("fill", function(d) { return colorScale(d)})
            .attr('y', function(d,i){ return i*25})
            .attr("width", 13)
            .attr("height", 13)
        colorLegendG.selectAll('colorLabels')
            .data(years)
            .enter()
            .append("text")
            .attr('transform', 'translate('+[17,8]+')')
            .attr("y", function(d,i){ return i*25})
            .style("fill", 'black')
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")            
}

//draw bar chart for the selected movie
function drawBarChart(movie) {
    //clear the bar chart first
    d3.select('#barG').remove()
    //store facebook likes values
    var facebookLikes = {'actor_1_facebook_likes': movie['actor_1_facebook_likes'], 'actor_2_facebook_like': movie['actor_2_facebook_likes'], 'actor_3_facebook_likes': movie['actor_3_facebook_likes'], 'director_facebook_likes': movie['director_facebook_likes'], 'cast_total_facebook_likes': movie['cast_total_facebook_likes'], 'movie_facebook_likes': movie['movie_facebook_likes']}
    //transform them into list
    var likesList = d3.entries(facebookLikes)

    var xScaleBar = d3.scaleLinear()
        .range([0, cellWidth - cellPadding])
        .domain([0, d3.max(d3.values(facebookLikes))])
    var yScaleBar = d3.scalePoint()
        .domain([["movie_facebook_likes"], ["cast_total_facebook_likes"], ["director_facebook_likes"], ["actor_3_facebook_likes"], ["actor_2_facebook_likes"], ["actor_1_facebook_likes"]])
        .range([cellHeight - cellPadding, cellHeight/2])        
        .padding(0.3)

    var barBand = (cellHeight - cellPadding - cellHeight/2) /6
    var barHeight = barBand * 0.8;

    var xAxisBar = d3.axisBottom(xScaleBar).ticks(6).tickSize(5, 0, 0);
    var yAxisBar = d3.axisLeft(yScaleBar).tickSize(5, 0, 0);

    var barG = svg.append('g')
        .attr('transform', 'translate('+[padding.l + cellWidth + 140, cellHeight/2 + 40]+')')
        .attr('id', 'barG')
    barG.append('g')
        .attr('class', 'axis-label')
        .append('text')
        .text(movie['movie_title'])
        .attr('transform', 'translate('+[cellWidth/4 + 30, -20]+')')
    barG.append('g')
        .attr('class', 'x axis-label')
        .attr('transform', 'translate(' +[0, cellHeight/2 - cellPadding]+ ')')
        .call(xAxisBar)
    barG.append('g')
        .attr('class', 'y axis-label')
        .attr('transform', 'translate(' +[0, -cellHeight/2]+ ')')
        .call(yAxisBar)
    
    var filteredMovie = barG.selectAll('.filteredMovie')
        .data(likesList)
    var filteredMovieEnter = filteredMovie.enter()
        .append('g')
        .attr('class', 'filteredMovie')
    filteredMovieEnter.merge(filteredMovie)
        .attr('transform', function(d,i) {
                return 'translate(' +[0, i * barBand + 3]+ ')';
            });
    filteredMovieEnter.append('rect')
        .attr('width', function(d,i){return xScaleBar(likesList[i].value)})
        .attr('margin', '10')
        /* DEBUGGING
        .text(function (d, i) {
                    console.log("d: " + d)
                    console.log("i: " + likesList[i].value)
                    return d
                })
        */
        .attr('height', barHeight)
    filteredMovie.exit().remove();
}   

// Remember code outside of the data callback function will run before the data loads
function dataPreprocessor(row) {
    return {
        'duration': +row['duration'],
        'aspect_ratio': +row['aspect_ratio'],
        'imdb_score': +row['imdb_score'],
        'budget': +row['budget'],
        'gross': +row['gross'],
        'num_user_for_reviews': +row['num_user_for_reviews'],
        'facenumber_in_poster': +row['facenumber_in_poster'],
        'num_voted_users': +row['num_voted_users'],
        'title_year': +row['title_year'],
        'movie_title': row['movie_title'],
        'actor_1_facebook_likes': +row['actor_1_facebook_likes'],
        'actor_2_facebook_likes': +row['actor_2_facebook_likes'],
        'actor_3_facebook_likes': +row['actor_3_facebook_likes'],
        'director_facebook_likes': +row['director_facebook_likes'],
        'cast_total_facebook_likes': +row['cast_total_facebook_likes'],
        'movie_facebook_likes': +row['movie_facebook_likes'],
        'content_rating': row['content_rating']
    };
}
