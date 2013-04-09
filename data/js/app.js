(function() {
  function uniq(arr) {
    return $.grep(arr, function(v, k){
      return $.inArray(v ,arr) === k;
    });
  }
  function plotUserCount(data) {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.count); });

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Количество участников");
  }

  parseDate = d3.time.format("%Y-%m-%d").parse

  d3.csv("users2.txt", function(e, users) {
    var dates = uniq(users.map(function(i) {return i.created_at;})).sort();
    var groupedUsers = {};
    dates.forEach(function(date) {
      groupedUsers[date] = [];
    });
    users.forEach(function(user) {
      groupedUsers[user.created_at].push(user);
    });
    userCount = [];
    count = 0;
    dates.forEach(function(date) {
      count += groupedUsers[date].length;
      userCount.push({date: parseDate(date), count: count})
    });
    plotUserCount(userCount);
  });
})();
