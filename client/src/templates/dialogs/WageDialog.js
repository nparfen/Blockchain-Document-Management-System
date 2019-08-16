import React, { useEffect } from 'react';
import { withTranslation } from 'react-i18next';
import { withSnackbar } from 'notistack';
import * as moment from 'moment';

import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import MomentUtils from '@date-io/moment';
import { DatePicker, MuiPickersUtilsProvider } from 'material-ui-pickers';

import Mutation from '../../app/graphql/components/Mutation'
import gql from 'graphql-tag'

import { Formik } from 'formik';
import * as Yup from 'yup';

import getRole from '../../app/helpers/getRole'
import getLang from '../../app/helpers/getLang'

// graphql mutation
const createReportMutation = gql`
  mutation($text: String!, $type: String!) {
    createReport(text: $text, type: $type) {
        id
        text
        type
        transactionId
        ipfsHash
        createdAt
        updatedAt
    }
  }
`;

// material ui styles
const styles = theme => ({
    form: {
        width: '100%',
    },
    date: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center'
    },
    dense: {
        marginTop: '9px',
        marginBottom: '4px'
    },
    denseTop: {
        marginTop: '8px',
    },
    textMR: {
        marginRight: '4px'
    },
    textML: {
        marginLeft: '4px'
    },
    title: {
        marginTop: '64px'
    },
    buttons: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
});

// yup validation
const jobsSchema = t => Yup.object().shape({
    date: Yup.mixed()
      .required(t('required')),
    salary: Yup.string()
      .min(1, t('smallDataAlert'))
      .max(20, t('largeDataAlert'))
      .required(t('required')),
});

// component
const WageDialog = ({ classes, enqueueSnackbar, open, onClose, t, i18n, role, name }) => {

    useEffect(() => {
        moment.locale(getLang(i18n))
    });

    return (
        <Dialog
            fullWidth
            disableBackdropClick
            disableEscapeKeyDown
            open={open}
            onClose={onClose} 
            scroll="body"
        >
            <Mutation 
                    errorPolicy="all"
                    mutation={createReportMutation}
                    onCompleted={({ createReport: { transactionId } }) => {
                        enqueueSnackbar(`The document was created by the transaction ${transactionId}`, { 
                            variant: 'success',
                        })
                    }}
                >
                {(createReport, { data, loading, error }) => (
                    <Formik
                        initialValues={{ date: new Date(), salary: "" }}
                        validationSchema={() => jobsSchema(t)}
                        onSubmit={async (values, { setSubmitting, resetForm }) => {
                            try {
                                const text = JSON.stringify(values)
                                await createReport({variables: { text: text, type: 'wage' }})
                                resetForm()
                            } catch(e){
                                setSubmitting(false)
                            }
                        }}
                    >
                    {({ isSubmitting, isValid, handleSubmit, handleChange, handleBlur, setFieldValue, setFieldError, values, errors, touched }) => (
                        <form 
                            className={classes.form} 
                            onSubmit={handleSubmit}
                            autoComplete="off"
                        >
                            <DialogContent>
                                <Typography 
                                    align="left"
                                    paragraph
                                >
                                    {t('nykredit')}
                                </Typography>
                                <Typography 
                                    variant="h5" 
                                    align="center"
                                >
                                    {t('report')} {moment().locale(getLang(i18n)).format('DD MMMM YYYY')}
                                </Typography>
                                <Typography align="center">
                                    {t('calculationOfWage')}
                                </Typography>
                                <div className={classNames(classes.date, classes.denseTop)}>
                                    <Typography 
                                        align="left"
                                        className={classes.textMR}
                                    >
                                        {t('in')}
                                    </Typography>
                                    <MuiPickersUtilsProvider 
                                        utils={MomentUtils}
                                        locale={getLang(i18n)}
                                        moment={moment}
                                    >
                                        <DatePicker 
                                            name="date"
                                            views={["year", "month"]}
                                            disableFuture
                                            disabled={isSubmitting}
                                            cancelLabel={t('cancel')}
                                            clearLabel={t('clear')}
                                            okLabel={t('ok')}
                                            format="MMMM YYYY"
                                            onChange={date => setFieldValue('date', date, true)}
                                            onError={(_, error) => setFieldError('date', error)}
                                            value={values.date}
                                            helperText={errors.date}
                                            error={Boolean(errors.date)}
                                        />
                                    </MuiPickersUtilsProvider>
                                    <Typography 
                                        align="left"
                                        className={classNames(classes.textMR, classes.textML)}
                                    >
                                        {t('accrued')}
                                    </Typography>
                                </div>
                                <div align="center">
                                    <TextField
                                        margin="dense"
                                        name="salary"
                                        type="text"
                                        disabled={isSubmitting}
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">{t('uah')}</InputAdornment>,
                                        }}
                                        onChange={handleChange}
                                        onBlur={handleBlur} 
                                        value={values.salary}
                                        helperText={touched.salary ? errors.salary : ""}
                                        error={touched.salary && Boolean(errors.salary)}
                                    />
                                </div>
                                <Typography 
                                    className={classes.dense} 
                                    align="right"
                                >
                                    {getRole(role, t) === undefined ? '-' : getRole(role, t).label}
                                    <br/>
                                    {name}
                                </Typography>
                            </DialogContent>
                            <DialogActions>
                                <div className={classes.buttons}>
                                    <Button 
                                        color="secondary"
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        {t('cancel')}
                                    </Button>
                                    <Button 
                                        type="submit"
                                        color="primary"
                                        disabled={isSubmitting || !isValid}
                                    >
                                        {t('sign')}
                                    </Button>
                                </div>
                            </DialogActions>
                        </form>
                    )}
                    </Formik>
                )}
            </Mutation>
        </Dialog>
    )
}

export default withSnackbar(withStyles(styles)(withTranslation()(WageDialog)))
