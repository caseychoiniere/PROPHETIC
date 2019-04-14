import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from "mobx-react";
import {withStyles} from "@material-ui/core/styles";
import { Exc } from '../../exclusions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import MainStore from "../../stores/MainStore";
import Collapse from "@material-ui/core/Collapse";
import Radio from "@material-ui/core/Radio";
import { Slider } from "material-ui-slider";
import TextField from "@material-ui/core/TextField";
import debounce from "lodash.debounce";
import {Color} from "../../theme/theme";

const styles = theme => ({
    wrapper: {
        margin: '8px 0px',
        padding: '0px 14px'
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
        color: Color.dark_turquoise
    },
    textFieldColor: { color: Color.dark_turquoise },
});

@observer
class HIV extends Component {

    state = {
       radio: null
    };

    waitForInput = debounce(value => MainStore.setExclusions(Exc["CD4 Count"][1], {min: value[0], max: value[1]}), 280);

    exclusionToggle = (input) => MainStore.toggleExclusion(input, false);

    getRange = () => {
        const { exclusions } = MainStore;
        let range = {min: 0, max: 1000};
        if(exclusions.has(Exc["CD4 Count"][0])) range = exclusions.get(Exc["CD4 Count"][0]).range;
        return range;
    };

    setSliderRange = value => this.waitForInput(value);

    // exclusionToggle = (exc) => {
    //     const { exclusions } = this.props;
    //     if(exclusions.has(Exc.CD4Count)) this.setState({radio: null});
    //     MainStore.toggleExclusion(exc, false);
    // };

    // radioToggle = (radio) => {
    //     let max = radio === Exc.CD4200 ? 200 : 400;
    //     this.setState({radio: radio});
    //     MainStore.deleteExclusions(Exc.CD4Count, false);
    //     if(radio !== null) MainStore.toggleExclusion(Exc.CD4Count, {min: 0, max: max});
    // };

    render() {
        const { classes, exclusions } = this.props;
        const { radio } = this.state;

        return (
            <span>
                <FormControlLabel
                    control={
                        <Switch
                            checked={exclusions.has(Exc.HIV_Infection[0])}
                            onChange={() => this.exclusionToggle(Exc.HIV_Infection[1])}
                            value="HIV"
                        />
                    }
                    label="HIV Positive"
                />
                <Collapse in={exclusions.has(Exc.HIV_Infection[0])} classes={{wrapper: classes.wrapper}}>
                        <Slider color="#bf4040"
                              value={[this.getRange().min, this.getRange().max]}
                              range
                              max={1000}
                              onChangeComplete={this.setSliderRange}
                              style={{width: 175, float: 'left', marginLeft: 10}}
                        />
                        <TextField
                            disabled={true}
                            value={`${this.getRange().min} - ${this.getRange().max}`}
                            style={{width: 91, marginLeft: 10, marginTop: 7}}
                            InputProps={{
                                disableUnderline: true,
                                classes: {
                                    input: classes.textFieldColor,
                                },
                            }}
                        />
                </Collapse>
            </span>
        );
    }
}

HIV.propTypes = {
    classes: PropTypes.object.isRequired,
    exclusions: PropTypes.object.isRequired,
};

export default withStyles(styles)(HIV);

{/*<FormControlLabel*/}
    {/*control={*/}
        {/*<Radio*/}
            {/*checked={exclusions.has(Exc.HIV_Infection[0]) && !exclusions.has(Exc["CD4 Count"]) && radio === null}*/}
            {/*onChange={() => this.radioToggle(null)}*/}
            {/*value="Any CD4 Count"*/}
        {/*/>*/}
    {/*}*/}
    {/*label="Any CD4 Count"*/}
{/*/>*/}
{/*<br/>*/}
{/*<FormControlLabel*/}
{/*control={*/}
{/*<Radio*/}
    {/*checked={exclusions.has(Exc.HIV_Infection[0]) && exclusions.has(Exc["CD4 Count"]) && radio === Exc.CD4200}*/}
    {/*onChange={() => this.radioToggle(Exc.CD4200)}*/}
    {/*value="CD4200"*/}
{/*/>*/}
{/*}*/}
{/*label="CD4 Count <200/µL"*/}
    {/*/>*/}
    {/*<br/>*/}
    {/*<FormControlLabel*/}
{/*control={*/}
{/*<Radio*/}
    {/*checked={exclusions.has(Exc.HIV_Infection[0]) && exclusions.has(Exc["CD4 Count"]) && radio === Exc.CD4400}*/}
    {/*onChange={() => this.radioToggle(Exc.CD4400)}*/}
    {/*value="CD4400"*/}
{/*/>*/}
{/*}*/}
{/*label="CD4 Count <400/µL"*/}
    {/*/>*/}
