import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { observer } from "mobx-react";
import MainStore from "../../stores/MainStore";
import { Exc } from '../../exclusions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

@observer
class AntibacterialTherapy extends Component {

    exclusionToggle = (input) => MainStore.toggleExclusion(input, false);

    render() {
        const { exclusions } = this.props;

        return (
            <span>
                <FormControlLabel
                    control={
                        <Switch
                            checked={exclusions.has(Exc.LessThanEqual_24_Hours_Antibacterial_Therapy[0])}
                            value="Participation in other clinical trial"
                            onChange={() => this.exclusionToggle(Exc.LessThanEqual_24_Hours_Antibacterial_Therapy[1])}
                        />
                    }
                    label="> 24 hours Prior Antibacterial Therapy"
                />
            </span>
        );
    }
}

AntibacterialTherapy.propTypes = {
    exclusions: PropTypes.object.isRequired,
};

export default AntibacterialTherapy;
