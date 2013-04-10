(function() {
  function uniq(arr) {
    return $.grep(arr, function(v, k){
      return $.inArray(v ,arr) === k;
    });
  }
  function plotUserCount(source, mentionCount) {
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = window.innerWidth - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
    var segWidth = width / (source.length - 1);

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
        .y1(function(d) { return y(d.count); })
        .interpolate("monotone");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var table = d3.select("body").append("div").attr("class", "mentions-container").append("table")
      .attr("class", "table mentions");

    var clip = svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width",  0)
        .attr("height", height);

    var clip2 = svg.append("defs").append("clipPath")
        .attr("id", "path")

    var data = [];
    x.domain(d3.extent(source, function(d) { return d.date; }));
    y.domain([0, d3.max(source, function(d) { return d.count; })]);

    var clip2 = svg.append("defs").append("clipPath")
        .attr("id", "path")
       .append("path")
        .datum(source)
        .attr("class", area)
        .attr("d", area);

    var opacity = d3.scale.linear()
        .range([.3, 1]);
    opacity.domain(d3.extent(mentionCount, function(d) {return d.count;}));

    var group = svg.append("g")
        .attr("clip-path", "url(#clip)");

    var path = group
      .append("path")
        .data([data])
        .attr("class", "area")
        .attr("d", area);

    group.selectAll(".bar")
      .data(mentionCount)
    .enter().append("rect")
      .attr("clip-path", "url(#path)")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.date); })
      .attr("width", segWidth - 0)
      .attr("y", 0)
      .attr("fill-opacity", function(d) { return opacity(d.count); })
      .attr("height", height)
      .on("mousedown", function(d) {
        table.selectAll("tr").remove();
        var tr = table.selectAll("tr")
          .data(window.groupedMentions[d3.time.format("%Y-%m-%d")(d.date)]);
        tr.enter().append("tr")
            .append("td").append("a")
              .attr("href", function(d) {return d.link;})
              .text(function(d) {return d.content;})
      });

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

    function tick() {
      var el = source.shift();
      if (el) {
        data.push(el);
        path.attr("d", area);
        clip.transition()
          .duration(100)
          .ease("linear")
          .attr("width", segWidth * (data.length - 1))
          .each("end", function() { tick(); });;
      }
    }
    tick();
  }

  parseDate = d3.time.format("%Y-%m-%d").parse

  d3.csv("users2.txt", function(e, users) {
    d3.tsv("mentions.txt", function(e, mentions) {
      var dates = uniq(users.map(function(i) {return i.created_at;})).sort();
      var groupedUsers = {};
      dates.forEach(function(date) {
        groupedUsers[date] = [];
      });
      users.forEach(function(user) {
        groupedUsers[user.created_at].push(user);
      });
      var userCount = [];
      var count = 0;
      dates.forEach(function(date) {
        count += groupedUsers[date].length;
        userCount.push({date: parseDate(date), count: count})
      });

      var mDates = uniq(mentions.map(function(i) {return i.date;})).sort();
      window.groupedMentions = {};
      mDates.forEach(function(date) {
        groupedMentions[date] = [];
      });
      mentions.forEach(function(mention) {
        groupedMentions[mention.date].push(mention);
      });
      var mentionCount = [];
      mDates.forEach(function(date) {
        mentionCount.push({date: parseDate(date), count: groupedMentions[date].length})
      });

      plotUserCount(userCount, mentionCount);
    });
  });
})();
