import React, { Component } from 'react';
import {observer} from "mobx-react";
import {withStyles} from "@material-ui/core/styles";
import {
    Chart,
    Geom,
    Tooltip,
    Coord,
    Label,
    Legend,
    Guide,
} from "bizcharts";
import {Color} from "../../theme/theme";
import MainStore from "../../stores/MainStore";
import CircularProgress from '@material-ui/core/CircularProgress';
import DataSet from "@antv/data-set";
import Paper from "@material-ui/core/Paper";

const styles = theme => ({
    root: {
        display: 'flex'
    },
    content: {
        margin: '2px 10px 10px 0px',
        flexGrow: 1,
        alignSelf: 'start',
        padding: theme.spacing.unit * 3,
        height: '92vh',
        overflow: 'auto',
    },
    progress: {
        position: 'absolute',
        top: '30%',
        right: '40%',
    }
});

@observer
class Graph extends Component {

    render() {
        const { Text } = Guide;
        const { DataView } = DataSet;
        const { classes } = this.props;
        let { graphData, loading } = MainStore;
        graphData = graphData.slice() || [{action: 'All Patients', pv: 100, range: false}];
        const dv = new DataView().source(graphData);
        dv.transform({
            type: 'percent',
            field: 'pv',
            dimension: 'action',
            as: 'percent'
        });
        let data = dv.rows;
        const cols = {
            percent: {
                nice: false
            }
        };

        return (
            <Paper className={classes.content}>
                { loading ? <CircularProgress color="secondary" size={80} className={classes.progress} /> :
                    <Chart height={400}
                           data={data}
                           scale={cols}
                           padding={['auto', 150, 'auto', 'auto']}
                           forceFit
                    >
                        <Tooltip showTitle={false}
                                 itemTpl='<li data-index={index} style="margin-bottom:4px;">
                                        <span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}<br/>
                                        <span style="padding-left: 16px">group：{pv}</span><br/><span style="padding-left: 16px"></span><br/>
                                      </li>'/>
                        <Coord type='rect'
                               transpose scale={[1, -1]}
                        />
                        <Legend clickable={false}/>
                        <Guide>
                            {data.map((obj) => {
                                return (
                                    <Text
                                        key={obj.action}
                                        top={true}
                                        width={40}
                                        position={{
                                            action: obj.action,
                                            percent: 'median'
                                        }}
                                        // content={parseInt(obj.percent * 100) + '%'}
                                        // content={`${obj.action } ${obj.pv} patients`} // Todo: Fix this to percent ?????
                                        content={`${obj.pv} patients`} // Todo: Fix this to percent ?????
                                        style={{
                                            fill: '#212121',
                                            fontSize: '12',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            shadowBlur: 3,
                                            shadowColor: '#E0E0E0'
                                        }}
                                    />
                                )
                            })}
                        </Guide>
                        <Geom type="intervalSymmetric"
                              position="action*percent"
                              shape='funnel'
                              color={['action', '#ff0000-#00ff00']}
                              tooltip={['action*pv*percent', (action, pv, percent) => {
                                  return {
                                      name: action,
                                      // percent: parseInt(percent * 100) + '%',
                                      pv: pv
                                  };
                              }]}
                        >
                            <Label content={['action*pv', (action, pv) => action + ' ' + pv]}
                                   offset={35}
                                   labeLine={{lineWidth: 1, stroke: 'rgba(0, 0, 0, 0.15)'}}
                                   textStyle={{
                                       textAlign: 'left',
                                       fill: Color.gray,
                                       fontSize: '12',
                                       fontWeight: 'bold',
                                       textBaseline: 'top'
                                   }}
                            />
                        </Geom>
                    </Chart>
                }
            </Paper>
        );
    }
}

export default withStyles(styles)(Graph);