import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from "mobx-react";
import {withStyles} from '@material-ui/core/styles';
import {Exc} from '../../exclusions';
import Collapse from '@material-ui/core/Collapse';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import Switch from '@material-ui/core/Switch';
import TextField from "@material-ui/core/TextField";
import {Color} from "../../theme/theme";
import MainStore from "../../stores/MainStore";

const styles = () => ({
    wrapper: {
        margin: '8px 0px',
        padding: '0px 14px'
    },
    label: {marginBottom: 10},
    textField: { color: Color.dark_turquoise }
});

@observer
class MaxAge extends Component {

    exclusionToggle = (input) => {
        MainStore.toggleExclusion(input, {min: 18, max: 100});
    };

    handleChange = e => {
        let value = parseInt(e.target.value, 10);
        MainStore.setExclusions(Exc.age, {min: 18, max: value});
        // MainStore.setExclusions(Exc.age, value);
    };

    render() {
        const { classes, exclusions} = this.props;
        const error = exclusions.has(Exc.age) && (isNaN(exclusions.get(Exc.age).range.max) || exclusions.get(Exc.age).range.max < 18);

        return (
            <span>
                <FormControlLabel
                    control={
                        <Switch
                            checked={exclusions.has(Exc.age)}
                            onChange={() => this.exclusionToggle(Exc.age)}
                            value="Set Maximum Age Limit"
                        />
                    }
                    label="Set Maximum Age Limit"
                />
                <Collapse in={exclusions.has(Exc.age)} classes={{wrapper: classes.wrapper}}>
                <TextField
                    error={error}
                    fullWidth={true}
                    variant="outlined"
                    label="Maximum Age"
                    defaultValue={100}
                    onChange={this.handleChange}
                    helperText={error && "Must be greater than or equal to 18"}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">Years</InputAdornment>,
                        classes: { input: classes.textField }
                    }}
                />
                </Collapse>
            </span>
        );
    }
}

MaxAge.propTypes = {
    classes: PropTypes.object.isRequired,
    exclusions: PropTypes.object.isRequired,
};

export default withStyles(styles)(MaxAge)