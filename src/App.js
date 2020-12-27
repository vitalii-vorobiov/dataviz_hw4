import React from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import {useEffect} from "react";
import {makeStyles, Typography} from "@material-ui/core";
import Plot from 'react-plotly.js';

const useStyles = makeStyles((theme) => ({
    religionButton: {
        margin: theme.spacing(1),
    },
}));

function App() {
    const classes = useStyles();
    const religions = ["Christians", "Muslims", "Unaffiliated", "Hindus", "Buddhists", "Jews", "Folk Religions", "Other Religions"]

    const [data, setData] = React.useState([]);
    const [mapData, setMapData] = React.useState([]);
    const [chartData, setChartData] = React.useState([]);
    const [religion, setReligion] = React.useState("Christians")
    const [country, setCountry] = React.useState("Ukraine")

    useEffect(() => {
        const getData = path => {
            return fetch(path
                ,{
                    headers : {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            )
                .then(response =>{
                    return response.json()
                })
                .then(myJson => {
                    return myJson.map(row => ({
                            "Year": row["Year"].trim(),
                            "Country": row["Country"].trim(),
                            "Christians": getInt(row["Christians"].trim()),
                            "Muslims": getInt(row["Muslims"].trim()),
                            "Unaffiliated": getInt(row["Unaffiliated"].trim()),
                            "Hindus": getInt(row["Hindus"].trim()),
                            "Buddhists": getInt(row["Buddhists"].trim()),
                            "Jews": getInt(row["Jews"].trim()),
                            "Folk Religions": getInt(row["Folk Religions"].trim()),
                            "Other Religions": getInt(row["Other Religions"].trim()),
                    }))
                });
        }

        let mounted = true;
        getData("Religious_Composition_by_Country_2010-2050.json").then(res => {
            if(mounted) {
                setData(res)
                setMapData(res.filter(row => row["Year"] === "2010" && row["Country"] !== "All Countries"))
                setChartData(res.filter(row => row["Country"] === country).map(row => ({
                    "Year": row["Year"],
                    "Value": row[religion]
                })))
            }
        })
        return () => mounted = false;
    }, [])

    const getInt = value => {
        return value.replaceAll(",", "").includes("<") ? 0 : parseInt(value.trim().replaceAll(",", ""))
    }

    const unpack = (rows, key) => {
        return rows.map(function(row) { return row[key]; });
    }

    return (
        <div className="App">
            <div className="Buttons">
                {religions.map((religion, index) =>
                    <Button className={classes.religionButton} variant="contained" key={index} onClick={() => {
                        setReligion(religion)
                        setChartData(data.filter(row => row["Country"] === country).map(row => ({
                            "Year": row["Year"],
                            "Value": row[religion]
                        })))
                    }}>{religion}</Button>
                )}
            </div>
            <div className="Map">
                <Plot
                    data={[{
                        type: 'choropleth',
                        locationmode: 'country names',
                        locations: unpack(mapData, 'Country'),
                        colorbar: {
                            title: `Amount of ${religion}`,
                            thickness: 30
                        },
                        autocolorscale: true,
                        z: unpack(mapData, religion),
                        text: unpack(mapData, 'Country'),
                    }]}
                    layout={{
                        title: `Number of ${religion} in 2010`,
                        width: window.innerWidth * 0.6,
                        height: 800,
                        geo: {
                            projection: {
                                type: 'natural earth'
                            }
                        }
                    }}
                    onClick={hover => {
                        setCountry(hover['points'][0]['location'])
                        setChartData(data.filter(row => row["Country"] === hover['points'][0]['location']).map(row => ({
                            "Year": row["Year"],
                            "Value": row[religion]
                        })))
                    }}
                />
                <Plot
                    data={[{
                        x: chartData.map(item => item["Year"]),
                        y: chartData.map(item => item["Value"]),
                        type: 'scatter'
                    }]}
                    layout={{
                        title: `${religion} in ${country} from 2010 to 2050`,
                        width: window.innerWidth * 0.3,
                    }}
                />
            </div>
            <Typography variant="body1" gutterBottom>
                Click on Country of interest to get detailed info
            </Typography>
        </div>
    );
}

export default App;
