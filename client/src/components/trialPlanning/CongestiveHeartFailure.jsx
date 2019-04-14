import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {observer} from "mobx-react";
import {withStyles} from "@material-ui/core/styles";
import { Exc } from '../../exclusions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import MainStore from "../../stores/MainStore";
import Collapse from "@material-ui/core/Collapse";
import Checkbox from "@material-ui/core/Checkbox";

const styles = () => ({
    wrapper: {
        margin: '8px 0px',
        padding: '0px 14px'
    },
});

@observer
class CongestiveHeartFailure extends Component {

    exclusionToggle = (input) => MainStore.toggleExclusion(input, false);

    render() {
        const { classes, exclusions } = this.props;
        return (
            <span>
                <FormControlLabel
                    control={
                        <Switch
                            checked={exclusions.has(Exc.Congestive_Heart_Failure[0])}
                            onChange={() => this.exclusionToggle(Exc.Congestive_Heart_Failure[1])}
                            value="Congestive Heart Failure"
                        />
                    }
                    label="Congestive Heart Failure"
                />
                <Collapse in={exclusions.has(Exc.Congestive_Heart_Failure[0])} classes={{wrapper: classes.wrapper}}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={exclusions.has(Exc.NYHA_Class_IV[0]) && exclusions.has(Exc.Congestive_Heart_Failure[0])}
                                onChange={() => this.exclusionToggle(Exc.NYHA_Class_IV[1])}
                                value="NYHA Class IV or CHF Symptoms at Rest"
                            />
                        }
                        label="NYHA Class IV or CHF Symptoms at Rest?"
                    />
                </Collapse>
            </span>
        );
    }
}

CongestiveHeartFailure.propTypes = {
    classes: PropTypes.object.isRequired,
    exclusions: PropTypes.object.isRequired,
};

export default withStyles(styles)(CongestiveHeartFailure);
