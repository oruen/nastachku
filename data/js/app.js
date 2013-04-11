(function() {
  function uniq(arr) {
    return $.grep(arr, function(v, k){
      return $.inArray(v ,arr) === k;
    });
  }
  function groupByAttr(attr, array) {
    var grouped = {};
    array.forEach(function(el) {
      if (el[attr] !== "") {
        if (!grouped[el[attr]]) {
          grouped[el[attr]] = [];
        }
        grouped[el[attr]].push(el);
      }
    });
    return grouped;
  }
  function countByAttr(attr, array) {
    var grouped = groupByAttr(attr, array);
    var counter = [];
    for (i in grouped) {
      if (grouped.hasOwnProperty(i)) {
        counter.push({name: i, count: grouped[i].length});
      }
    };
    return counter;
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

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var mentionsTable = d3.select("#info").append("div").attr("class", "mentions-container").append("table")
      .attr("class", "table mentions");
    var usersTable = d3.select("#info").append("div").attr("class", "users-container").append("table")
      .attr("class", "table users");

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

    var opacity = d3.scale.sqrt()
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
        mentionsTable.selectAll("tr").remove();
        mentionsTable.selectAll("tr")
          .data(window.groupedMentions[d3.time.format("%Y-%m-%d")(d.date)])
          .enter().append("tr")
            .append("td").append("a")
              .attr("href", function(d) {return d.link;})
              .text(function(d) {return d.content;});
        usersTable.selectAll("tr").remove();
        usersTable.selectAll("tr")
          .data(window.groupedUsers[d3.time.format("%Y-%m-%d")(d.date)])
          .enter().append("tr")
            .append("td")
              .text(function(d) {
                return [[d.first_name, d.last_name].filter(function(i) {return !!i;}).join(" "),
                         d.company,
                         d.city].filter(function(i) {return !!i;}).join(", ");
              });
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
          .duration(300)
          .ease("linear")
          .attr("width", segWidth * (data.length - 1))
          .each("end", function() { tick(); });
        var date = d3.time.format("%Y-%m-%d")(el.date);
        var group = groupByAttr("city", window.groupedUsers[date]);
        for (i in group) {
          if (group.hasOwnProperty(i)) {
            window.usersCount.filter(function(j) { return j.name == i })[0].count += group[i].length;
          }
        }
        d3.select("#map svg").selectAll("circle").filter(function(d) {return d.count > 0})
          .transition()
          .duration(300)
          .ease("linear")
          .attr("r", function(d) {return window.radius(d.count);});
      }
    }
    tick();
  }

  function plotGeo(users) {
    var origin = [88.22, 74.19],
        degrees = 180 / Math.PI,
        δ = 1000 / 6371 * degrees;

    var equidistant = d3.geo.azimuthalEquidistant().translate([600, 600]).clipAngle(120);

    var path = d3.geo.path().pointRadius(0),
        circle = d3.geo.circle().origin(origin),
        format = d3.format(",d");

    function ulsk(projection) {
      return projection
          .scale(650)
          .rotate([-origin[0], -origin[1], 0]) .precision(.1);
    }

    var svg = d3.select("#map")
        .data([ulsk(equidistant)])
      .append("svg");

    svg.each(function(projection) {
      var t = projection.translate();
      d3.select(this)
          .attr("width", 3 * t[0])
          .attr("height", 3 * t[1]);
    });

    svg.append("filter")
        .attr("id", "glow")
      .append("feGaussianBlur")
        .attr("stdDeviation", 3);

    svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "background");

    var g = svg.append("g");

    svg.append("path")
        .attr("class", "graticule")
        .datum(d3.geo.graticule()());

    svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "outline");

    svg.append("path")
        .datum({type: "Point", coordinates: origin});

    window.usersCount = [];
    var tmp = [];
    for (i in users) {
      if (users.hasOwnProperty(i)) {
        tmp.push({name: i, count: users[i].length});
        usersCount.push({name: i, count: 0});
      }
    };
    window.radius = d3.scale.log().range([3, 15]);
    var color = d3.scale.category20();
    radius.domain(d3.extent(tmp, function(d) {return d.count;}));
    //radius.domain([0, d3.max(tmp, function(d) {return d.count;})]);
    svg.selectAll("circle").data(usersCount).enter()
      .append("circle")
        .attr("transform", function(d) {
          return "translate(" + equidistant(Geocode[d.name]) + ")";
        })
        //.attr("r", function(d) { return radius(d.count); })
        .attr("r", 0)
        .attr("fill", function(d) {return color(d.name);})
        .on("mousedown", function(d) {
          var mentionsTable = d3.select("table.mentions");
          var usersTable = d3.select("table.users");
          mentionsTable.selectAll("tr").remove();
          usersTable.selectAll("tr").remove();
          usersTable.selectAll("tr")
            .data(users[d.name])
            .enter().append("tr")
              .append("td")
                .text(function(d) {
                  return [[d.first_name, d.last_name].filter(function(i) {return !!i;}).join(" "),
                           d.company,
                           d.city].filter(function(i) {return !!i;}).join(", ");
                });
        });

    svg.each(redraw);

    d3.json("../world-50m.json", function(error, world) {
      var land = topojson.feature(world, world.objects.land);
      g.append("path")
          .datum(land)
          .attr("class", "land-glow");
      g.append("path")
          .datum(land)
          .attr("class", "land");
      g.append("path")
          .datum(topojson.mesh(world, world.objects.countries))
          .attr("class", "border");
      g.each(redraw);
    });

    function redraw(projection) {
      d3.select(this).selectAll("path").attr("d", path.projection(projection));
    }
  }

  parseDate = d3.time.format("%Y-%m-%d").parse

  d3.csv("users2.txt", function(e, users) {
    d3.csv("mentions2.txt", function(e, mentions) {
      var dates = uniq(users.map(function(i) {return i.created_at;})).sort();
      window.groupedUsers = {};
      var usersByArea = {};
      dates.forEach(function(date) {
        groupedUsers[date] = [];
      });
      users.forEach(function(user) {
        if (user.city !== "") {
          groupedUsers[user.created_at].push(user);
          if (!usersByArea[user.city]) {
            usersByArea[user.city] = [];
          }
          usersByArea[user.city].push(user);
        }
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

      plotGeo(usersByArea);
      plotUserCount(userCount, mentionCount);
    });
  });
})();
