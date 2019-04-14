import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {observer} from "mobx-react";
import { withStyles } from '@material-ui/core/styles';
import MainStore from "../../stores/MainStore";
import { Exc } from "../../exclusions";
import { Color } from '../../theme/theme'
import {Slider} from "material-ui-slider";
import Collapse from '@material-ui/core/Collapse';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextField from "@material-ui/core/TextField";
import debounce from "lodash.debounce";

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
class ApacheScore extends Component {

    waitForInput = debounce(value => MainStore.setExclusions(Exc.APACHE_II_Score[1], {min: value[0], max: value[1]}), 280);

    exclusionToggle = (input) => MainStore.toggleExclusion(input, {min: 0, max: 71});

    getRange = () => {
        const { exclusions } = MainStore;
        let range = {min: 0, max: 71};
        if(exclusions.has(Exc.APACHE_II_Score[0])) range = exclusions.get(Exc.APACHE_II_Score[0]).range;
        return range;
    };

    setSliderRange = value => this.waitForInput(value);

    render() {
        const { classes, exclusions } = this.props;

        return (
           <span>
                <FormControlLabel
                    control={
                        <Switch
                            checked={exclusions.has(Exc.APACHE_II_Score[0])}
                            onChange={() => this.exclusionToggle(Exc.APACHE_II_Score[1])}
                            value="Set Apache II Score Range"
                        />
                    }
                    label="Set Apache II Score Range"
                />
                <Collapse in={exclusions.has(Exc.APACHE_II_Score[0])} classes={{wrapper: classes.wrapper}}>
                        <Slider color="#bf4040"
                                value={[this.getRange().min, this.getRange().max]}
                                range
                                max={71}
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

ApacheScore.propTypes = {
    classes: PropTypes.object.isRequired,
    exclusions: PropTypes.object.isRequired,
};

export default withStyles(styles)(ApacheScore);