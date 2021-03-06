import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import MainStore from '../stores/MainStore';
import { Color } from '../theme/theme';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import FileDownload from '@material-ui/icons/FileDownload';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    expandedPanel: {
        margin: '10px -10px',
        borderLeft: `solid 4px ${Color.light_blue}`,
        borderRadius: `4px 0px 0px 4px`
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        fontWeight: theme.typography.fontWeightRegular,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    root: {
        width: '100%',
    },
});

@observer
class DatasetList extends Component {

    downloadDataset = (id) => {
        MainStore.toggleModal('dlq');
        MainStore.queueDownload(id);
    };

    expandPanel = (id) => {
        MainStore.toggleExpandedPanel(id)
    };

    render() {
        const { classes } = this.props;
        const { datasets, expandedPanels } = MainStore;
        return (
            <div>
                {datasets && datasets.map((d) => {
                    return (
                        <ExpansionPanel key={d.id}
                                        expanded={expandedPanels.has(d.id)}
                                        onChange={() => this.expandPanel(d.id)}
                                        className={expandedPanels.has(d.id) ? classes.expandedPanel : ''}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography className={classes.heading}>{d.file.name}</Typography>
                            </ExpansionPanelSummary>
                            {d.metadata &&
                                d.metadata.map(m => {
                                    return <ExpansionPanelDetails key={m.template_property.id}>
                                        <Typography>
                                            <span style={{fontWeight: 800}}>{m.template_property.label}</span> {m.value}
                                        </Typography>
                                    </ExpansionPanelDetails>
                                })
                            }
                            <ExpansionPanelDetails>
                                <Typography>
                                    <b>Added by </b> {d.file.audit.created_by.full_name}
                                </Typography>
                            </ExpansionPanelDetails>
                            <Divider />
                            <ExpansionPanelActions>
                                <Button size="small" color="primary" onClick={() => this.downloadDataset(d.file.id)}>
                                    Download Data
                                    <FileDownload className={classes.rightIcon} />
                                </Button>
                            </ExpansionPanelActions>
                        </ExpansionPanel>
                    )
                })
                }
            </div>
        );
    }
}

DatasetList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DatasetList);