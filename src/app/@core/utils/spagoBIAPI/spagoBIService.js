import { environment } from '../../../../environments/environment';

const { SPAGOBI } = environment;

function setBaseUrl(config) {
    Sbi.sdk.services.setBaseUrl(config);
}

function authenticate(config) {
    Sbi.sdk.api.authenticate(config);
}

function getDocumentHtml(config) {
    var html = Sbi.sdk.api.getDocumentHtml(config);
    return html;
}

function getReport(scope, callbackFunction) {
    const baseUrl = {
        protocol: SPAGOBI.PROTOCOL,
        host: SPAGOBI.HOST,
        port: SPAGOBI.PORT,
        contextPath: SPAGOBI.CONTEXTPATH,
        controllerPath: 'servlet/AdapterHTTP'
    };
    const authConf = {
        params: {
            user: SPAGOBI.USER,
            password: SPAGOBI.PASSWORD
        },
        callback: {
            fn: callbackFunction,
            scope: scope
        }
    };
    setBaseUrl(baseUrl);
    authenticate(authConf);
}

function buildUrl(documentLabel, parameters) {
    const label = environment.SPAGOBI[documentLabel];
    const url = environment.SPAGOBI.PROTOCOL + '://' + environment.SPAGOBI.HOST + '/' + environment.SPAGOBI.CONTEXTPATH +
        '/servlet/AdapterHTTP?ACTION_NAME=EXECUTE_DOCUMENT_ACTION&NEW_SESSION=TRUE&IGNORE_SUBOBJECTS_VIEWPOINTS_SNAPSHOTS=true&flag=0&TOOLBAR_VISIBLE=true&OBJECT_LABEL=' +
        label + (parameters ? '&PARAMETERS=' + parameters : '');
    return url;
}

var spagoBIService = {};

/*
spagoBIService.setBaseUrl = setBaseUrl;
spagoBIService.getDocumentHtml = getDocumentHtml;
spagoBIService.authenticate = authenticate;
*/

spagoBIService.getReport = getReport;
spagoBIService.getDocumentHtml = getDocumentHtml;
spagoBIService.buildUrl = buildUrl;

export { spagoBIService };