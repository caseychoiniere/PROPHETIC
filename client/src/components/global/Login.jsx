import React, { Component } from 'react';
import { observer } from 'mobx-react';
import AuthStore from '../../stores/AuthStore';
import MainStore from '../../stores/MainStore';
import { withStyles } from '@material-ui/core/styles';
import CTTI_logo from '../../images/CTTI_logo.png';
import { Color } from '../../theme/theme';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

const styles = {
    cardActions: {
        padding: 40,
        display: 'flex',
        flex: '1 0 auto',
        alignItems: 'flex-end',
        justifyContent: 'center',
        border: `1px solid ${Color.medium_blue}`,
        position: 'relative',
    },
    cardContent: {
        backgroundColor: Color.medium_blue,
    },
    contentColor: {
        color: Color.white,
    },
    media: {
        minHeight: 300,
        maxWidth: 600,
        objectFit: 'cover',
    },
    paper: {
        boxShadow: 'none',
        border: `1px solid ${Color.medium_blue}`,
    },
    progress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    }
};

@observer
class Login extends Component {

    login = () => {
        MainStore.toggleLoading();
        AuthStore.login();
    };

    render() {
        const { classes } = this.props;
        const { loading } = MainStore;

        return (
            <Card classes={{root: classes.paper}}>
                    <CardMedia
                        component="img"
                        className={classes.media}
                        image={CTTI_logo}
                        title="CTTI Logo"
                    />
                    <CardContent className={classes.cardContent}>
                        <Typography gutterBottom variant="h5" component="h2" className={classes.contentColor}>
                            Publicly Available Data
                        </Typography>
                        <Typography component="p" className={classes.contentColor}>
                            The Clinical Trials Transformation Initiative is committed to develop and
                            drive adoption of practices that will increase the quality and efficiency of clinical trials.
                        </Typography>
                        <Typography component="p" className={classes.contentColor}>
                            Improvements in the clinical trials enterprise happen through transformative and incremental change.
                            We create recommendations and tools every year to improve clinical trials and
                            make publicly available the data upon which recommendations are based.
                        </Typography>
                        <Typography component="p" className={classes.contentColor}>
                            You can learn more about what we do at
                            <a href="https://www.ctti-clinicaltrials.org/who-we-are/strategic-plan"
                               style={{color: Color.white, paddingLeft: 10}}
                            >
                                CTTI-Clinicaltrials.org
                            </a>
                        </Typography>
                    </CardContent>
                <CardActions className={classes.cardActions}>
                    <Button size="small"
                            color="primary"
                            variant="outlined"
                            disabled={loading}
                            onClick={this.login}>
                        Login
                    </Button>
                    {loading && <CircularProgress size={24} className={classes.progress} />}
                </CardActions>
            </Card> : null
        );
    }
}

export default withStyles(styles)(Login);