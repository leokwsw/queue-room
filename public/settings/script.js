const endpoint = 'http://localhost:3000';

const form = {
    settings: {},
    onSubmit() {
        $('form#setting-form').on('submit', (e) => {
            e.preventDefault();
            $('#confirm-modal').toggleClass('hidden');
        });
    },
    onConfirmSubmit() {
        const that = this;
        $('#confirm-submit').on('click', async () => {
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
                alert(error.response.data);
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
        const response = await axios.post(
            `${endpoint}/update-settings/${namespace}`,
            {
                ...formData,
            },
            {
                auth: {
                    username: 'admin',
                    password: 'password',
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
        this.onSubmit();
        this.getSettings();
        this.onConfirmSubmit();
        this.onConfirmCancel();
        this.onReset();
    },
};

$(function () {
    form.init();
});
