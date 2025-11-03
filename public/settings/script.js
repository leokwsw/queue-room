const endpoint = 'http://localhost:3000';

const form = {
    settings: {},
    credentials: {
        username: null,
        password: null,
    },
    checkCredentials() {
        const storedCredentials = sessionStorage.getItem('settingsCredentials');
        if (storedCredentials) {
            try {
                const parsed = JSON.parse(storedCredentials);
                this.credentials.username = parsed.username;
                this.credentials.password = parsed.password;
                return true;
            } catch (e) {
                sessionStorage.removeItem('settingsCredentials');
                return false;
            }
        }
        return false;
    },
    showLoginModal() {
        $('#login-modal').removeClass('hidden');
        $('#login-username').focus();
    },
    hideLoginModal() {
        $('#login-modal').addClass('hidden');
        $('#login-error').addClass('hidden');
        $('#login-username').val('');
        $('#login-password').val('');
    },
    onLoginSubmit() {
        const that = this;
        $('#login-submit').on('click', () => {
            const username = $('#login-username').val().trim();
            const password = $('#login-password').val().trim();
            
            if (!username || !password) {
                $('#login-error').removeClass('hidden');
                return;
            }
            
            that.credentials.username = username;
            that.credentials.password = password;
            sessionStorage.setItem('settingsCredentials', JSON.stringify({
                username: username,
                password: password,
            }));
            
            that.hideLoginModal();
        });
    },
    onLoginCancel() {
        $('#login-cancel').on('click', () => {
            this.hideLoginModal();
        });
    },
    onSubmit() {
        const that = this;
        $('form#setting-form').on('submit', (e) => {
            e.preventDefault();
            if (!that.checkCredentials()) {
                that.showLoginModal();
                return;
            }
            $('#confirm-modal').toggleClass('hidden');
        });
    },
    onConfirmSubmit() {
        const that = this;
        $('#confirm-submit').on('click', async () => {
            if (!that.checkCredentials()) {
                that.showLoginModal();
                $('#confirm-modal').toggleClass('hidden');
                return;
            }
            
            const formData = $('form#setting-form')
                .serializeArray()
                .reduce((data, item) => {
                    data[item.name] = item.value;
                    return data;
                }, {});
            console.log(formData);
            // const trustedIp = formData.trustedIp.replace(' ', '').split(',');
            // formData.trustedIp = trustedIp;
            // formData.isMaintenance = formData.isMaintenance === '1';
            try {
                await that.updateSettings(formData);
                $('#confirm-modal').toggleClass('hidden');
                location.reload();
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    sessionStorage.removeItem('settingsCredentials');
                    that.credentials.username = null;
                    that.credentials.password = null;
                    alert('Authentication failed. Please login again.');
                    that.showLoginModal();
                    $('#confirm-modal').toggleClass('hidden');
                } else {
                    alert(error.response?.data || error.message);
                }
            }
        });
    },
    onConfirmCancel() {
        $('#confirm-cancel').on('click', () => {
            $('#confirm-modal').toggleClass('hidden');
        });
    },
    onReset() {
        $('#reset-button').on('click', (e) => {
            e.preventDefault();
            this.getSettings();
        });
    },
    async updateSettings(formData, namespace = 'main') {
        if (!this.checkCredentials()) {
            throw new Error('Credentials not available');
        }
        
        const response = await axios.post(
            `${endpoint}/update-settings/${namespace}`,
            {
                ...formData,
            },
            {
                auth: {
                    username: this.credentials.username,
                    password: this.credentials.password,
                },
            }
        );
        console.log(response);
    },
    async getSettings(namespace = 'main') {
        const response = await axios.get(
            `${endpoint}/get-settings/${namespace}`
        );
        this.setInputFields(response.data);
    },
    setInputFields(settings) {
        for (const key in settings) {
            if (key === 'isMaintenance') {
                const isMaintenance =
                    settings[key] === 'true' || settings[key] === true;
                $(`select#${key}`).val(isMaintenance ? '1' : '0');
            } else {
                $(`input#${key}`).val(settings[key]);
            }
            // console.log(`${key}: ${settings[key]}`);
        }
    },
    async init() {
        this.checkCredentials();
        this.onSubmit();
        this.getSettings();
        this.onConfirmSubmit();
        this.onConfirmCancel();
        this.onReset();
        this.onLoginSubmit();
        this.onLoginCancel();
        
        // Allow Enter key to submit login form
        $('#login-username, #login-password').on('keypress', (e) => {
            if (e.which === 13) {
                $('#login-submit').click();
            }
        });
    },
};

$(function () {
    form.init();
});
