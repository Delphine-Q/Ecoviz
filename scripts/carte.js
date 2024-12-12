//svg
const svg = d3.select("#map")
  .append("svg")
  .attr("width", 750)
  .attr("height", 450);

//projection et path
let projection = d3.geoMercator()
.scale(110)
.center([5, 10])
.translate([375, 300]);
let path = d3.geoPath().projection(projection);


Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"), // World map GeoJSON
  d3.csv("data/annual-co2-emissions-per-country.csv"),
  d3.csv("data/contributions-global-temp-change.csv"),
]).then(([geoData, emissionData, temperatureData]) => {
  
    //Dessiner la carte
    const countries = svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "white")
      .attr("stroke", "#333")
      .attr("stroke-width","1")


    //zoom dans les continents
    let scale = 1
    let x = 0, y = 0
    let zoom = d3.zoom()
    .on("zoom", zoomed)

    function zoomed({transform}) {
      countries.attr("transform", transform);
    }

    //parametres de zoom en fonction des continents
    const continentButtons = document.querySelectorAll(".conButton");
    continentButtons.forEach((continentButton) => {
      continentButton.addEventListener("click", () => {
          continentButtons.forEach((b) => {b.classList.remove("chosen")})
          continentButton.classList.add("chosen")
          switch (continentButton.id) {
              case "W" : 
                  scale = 1
                  x = 0
                  y = 0
                  break;
              case "NA" : //Ameri
                  scale = 2
                  x = 20
                  y = -110
                  break;
              case "SA" : //done
                  scale = 2.5
                  x = -90
                  y = -270
                  break;
              case "EU" : //done
                  scale = 2.7
                  x = -260
                  y = -110
                  break;
              case "AS" : 
                  scale = 2.5
                  x = -380
                  y = -170
                  break;
              case "AF" : //done
                  scale = 2.6
                  x = -250
                  y = -220
                  break;
              case "OC" : //done
                  scale = 3.4
                  x = -520
                  y = -300
                  break;
              } 

          svg
            .call(zoom.filter(clicked()))

          clicked(x,y,scale);

          //transitions entre des zooms
          function clicked(x, y, scale) {
              svg.transition().duration(800).call(
                zoom.transform,
                d3.zoomIdentity.scale(1).translate(0, 0) 
              ).on("end", () => {
                svg.transition().duration(1000).call(
                  zoom.transform,
                  d3.zoomIdentity.scale(scale).translate(x, y)
                );
              })
            }
        })
    });


    //toggle entre 2 modes d'affichage (tableau ou carte)
    const displayTable = d3.select("#display-table")
    const displayMap = d3.select("#display-map")
    const displayOptions = document.querySelectorAll("#display-options button");

    displayOptions.forEach((button) => {
      button.addEventListener("click", () => {
          displayOptions.forEach((b) => {b.classList.remove("chosen")})
          button.classList.add("chosen")
          switch (button.id) {
            case "option-table":
              displayMap.style("display","none");
              displayTable.style("display","block");
              break;
            case "option-map":
              displayMap.style("display","block");
              displayTable.style("display","none");
              break;
          }
        })
    });
    

  //toggle les donnees presentees (CO2 ou temperature)
  const tablinks = document.querySelectorAll(".tablink");
  tablinks.forEach((tablink) => {
    tablink.addEventListener("click", () => {
        tablinks.forEach((t) => {t.classList.remove("active")})
        tablink.classList.add("active")
        switch (tablink.id) {
          case "co2":
            d3.select("#option-map").dispatch('click');
            drawGraphic("Évolution des émissions annuelles de CO2 (en tonnes)",emissionData,"emissions_total",co2Scale,[1000,10000,100000,1000000,10000000,100000000,1000000000],".2s","Emissions annuelles CO2 (en tonnes)")
            break;
          case "temperature":
            d3.select("#option-map").dispatch('click');
            drawGraphic("Évolution de la contribution au réchauffement climatique",temperatureData,"share_of_temperature_response_ghg_total",tempScale,[0.01,0.1,0.5,1,5,10,20],".1r", "Contribution au rechauffement climatique (en %)"," %")
            break;
        }

      })
  });


    //differences dans les parametres des 2 graphiques
    const co2Scale = d3.scaleLog()
    .domain([1000,100000,100000000,1000000000])
    .range(["#7BC13D","#DBDCA0","#EFAE3A","#C53026"]);
  
    const tempScale = d3.scaleLog()
    .domain([0.01,0.1,1,20])
    .range(["#7BC13D","#DBDCA0","#EFAE3A","#C53026"]);


  //infobulle qui s'affiche en hover
  let tooltip = d3.select("#map")
    .append("div")
    .style("display", "none")
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("position", "absolute")
    .style("z-index", "100")

  //Dessiner les graphiques/tableaux
  function drawGraphic(title,dataTable,dataValue,scale,cells,format,dataName,unit = "") {
        //trier les donnees par annee
        let dataByYear = {};

        dataTable.forEach(row => {
          const year = row.Year;
          if (!dataByYear[year]) dataByYear[year] = {};
          dataByYear[year][row.Code] = [row.Entity,row[dataValue]];
        });

      //changer le titre du graphique
      const graphTitle = document.querySelector("#graph-title");
      graphTitle.innerHTML = title

      //definir le colorscale
      const colorScale = scale

      //legendes
        const color = d3.select("#color");
        color.html("");
        color.append("g")
        .attr("class", "legendSequential")
        .attr("transform", "translate(20,20)")

        //legende de colorscale
        const legendSequential = d3.legendColor()
            .shapeWidth(20)
            .shapeHeight(50)
            .cells(cells)
            .orient("vertical")
            .scale(colorScale) 
            .title("Légende")
            .labels(["≤ "+d3.format(format)(cells[0]) + unit,d3.format(format)(cells[1]) + unit, d3.format(format)(cells[2]) + unit, d3.format(format)(cells[3]) + unit, d3.format(format)(cells[4]) + unit, d3.format(format)(cells[5]) + unit, "≥ "+ d3.format(format)(cells[6]) + unit])

          color.select(".legendSequential")
            .call(legendSequential);

          color.append("g")
            .attr("class", "legendUndefined")
            .attr("transform", "translate(20,430)")

          //legend pour les valeurs inconnues
          const unknown =  d3.scaleOrdinal()
            .domain(['Inconnu'])
            .range(["#ccc"] );
          
          const legendUndefined = d3.legendColor()
            .shapeWidth(20)
            .shapeHeight(50)
            .cells(1)
            .scale(unknown) 
            .labels("Inconnu")

          color.select(".legendUndefined")
            .call(legendUndefined);


        
      //mettre a jour la carte
      function updateMap(year) {
        d3.select("#currentYear").text(year);
          const data = dataByYear[year];
          countries
          .attr("fill", d => {
              const iso = d.id;
              if (typeof data[iso] !== 'undefined') {
                if (data[iso][1]<cells[0]) {
                  return "#7BC13D";
                } else return colorScale(data[iso][1]);
              } else return "#ccc";
          })
          .attr("value", d => {
            const iso = d.id;
            return (typeof data[iso] !== 'undefined') ? data[iso][1] : "Inconnu";
        })
        //afficher infobulle en survol des pays
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)


        //afficher/cacher infobulle
          function mouseover(d) {
            tooltip
              .style("display", "block")
            d3.select(this)
              .style("stroke-width", 2)
          }
      
          function mousemove(d) {
            tooltip
              .html("<p style='margin:0'><strong style='margin:0 12px 0 0'>" + d.target.__data__.properties.name + "</strong><br>" + d3.select(this).attr("value") + "</p>")
              .style("left", (event.clientX - 300) + "px")
              .style("top", (event.clientY - 100) + "px")
          }
          function mouseleave(d) {
            tooltip
              .style("display", "none")
            d3.select(this)
            .style("stroke-width", "1")
          }

        }

        //creer et mettre a jour le tableau
        function updateTable(year) {
          displayTable.html("");
          const table = displayTable.append("table");
          const header = table.append("thead").append("tr");
          header.append("th").text("Pays");
          header.append("th").text(dataName);
  
          const tbody = table.append("tbody");
          const data = dataByYear[year];
          Object.entries(data).forEach(entry => {
            const [iso, value] = entry;
            if (iso!="" && iso!="OWID_WRL") {
              const row = tbody.append("tr");
              row.append("td").text(value[0]);
              row.append("td").text(value[1]);
            }
          });
        }
  
      //mise a jour en fonction de l'annee choisie avec le slider
      d3.select("#yearSlider").on("input", function () {
        updateMap(this.value);
        updateTable(this.value);
      });

      d3.select("#yearSlider").dispatch('input');

  }
    //initialize avec le graphique CO2
    d3.select("#co2").dispatch('click');


})