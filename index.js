const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        console.log('Iniciando navegação para a página inicial...');
        await page.goto('https://magento.softwaretestingboard.com/');

        console.log('Obtendo o título da página...');
        const title = await page.title();
        console.log('Título da página:', title);

        const endPointProdutos = '/catalogsearch/result/';
        const emailUnico = () => `jonbonjovi${Date.now()}@hotmail.com`;
        const waitfor = ms => new Promise(resolve => setTimeout(resolve, ms));

        console.log('Clicando no botão de cadastro...');
        const result = await page.evaluate(() => {
            const link = document.querySelector('a[href="https://magento.softwaretestingboard.com/customer/account/create/"]');
            if (link) {
                link.click();
                return "Cliquei no cadastro";
            } else {
                return "Botão de cadastro não encontrado";
            }
        });
        console.log(result);

        console.log('Preenchendo formulário de cadastro...');
        await page.waitForSelector('#firstname');
        await page.type('#firstname', "john");
        await page.waitForSelector('#lastname');
        await page.type('#lastname', "bon jovi");
        await page.waitForSelector('#email_address');
        await page.type('#email_address', emailUnico());
        await page.waitForSelector('#password');
        await page.type('#password', "B3d@fRoses");
        await page.waitForSelector('#password-confirmation');
        await page.type('#password-confirmation', "B3d@fRoses");

        console.log('Enviando formulário de cadastro...');
        await page.waitForSelector('button.action.submit.primary');
        await page.click('button.action.submit.primary');

        console.log('Aguardando resposta da pesquisa...');
        const [response] = await Promise.all([
            page.waitForResponse(response => response.url().includes(endPointProdutos) && response.status() === 200),
            (async () => {
                await page.waitForSelector('input[name="q"]');
                await page.type('input[name="q"]', 'shirt');
                await page.click('input[name="q"]');
                await page.keyboard.press('Enter');
                console.log("Pesquisa executada");
            })()
        ]);
        console.log('Resposta da pesquisa:', response.status());

        console.log('Aguardando itens de produto...');
        await page.waitForSelector('.product-item');
        const quantidadeItems = await page.evaluate(() => {
            return document.querySelectorAll('ol.products.list.items.product-items li.item.product.product-item').length;
        });
        console.log('Quantidade de itens encontrados:', quantidadeItems);

        console.log('Clicando no último item...');
        const resultClick = await page.evaluate((ultimoIndice) => {
            const items = document.querySelectorAll('ol.products.list.items.product-items li.item.product.product-item');
            const ultimoItem = items[ultimoIndice - 1];
            if (ultimoItem) {
                const clickUltimoItem = ultimoItem.querySelector('.product-item-link');
                if (clickUltimoItem) {
                    clickUltimoItem.click();
                    return { sucesso: true, mensagem: "Cliquei no último item" };
                } else {
                    return { sucesso: false, mensagem: "Não foi possível clicar no item" };
                }
            } else {
                return { sucesso: false, mensagem: "Último item não encontrado" };
            }
        }, quantidadeItems);
        console.log(resultClick.mensagem);

        console.log('Selecionando opções do produto...');
        await page.waitForSelector('#option-label-size-143-item-170');
        await page.click('#option-label-size-143-item-170');
        await page.waitForSelector('#option-label-color-93-item-50');
        await page.click('#option-label-color-93-item-50');

        console.log('Adicionando produto ao carrinho...');
        await page.waitForSelector('#product-addtocart-button');
        await page.click('#product-addtocart-button');

        console.log('Aguardando atualização do carrinho...');
        await page.waitForFunction(() => {
            const cartCounter = document.querySelector('.counter-number');
            return cartCounter && parseInt(cartCounter.textContent) > 0;
        });

        await waitfor(2000);

        console.log('Abrindo carrinho...');
        await page.waitForSelector('a.action.showcart');
        await page.click('a.action.showcart');

        console.log('Clicando no botão de checkout...');
        await page.waitForSelector('#top-cart-btn-checkout');
        await page.click('#top-cart-btn-checkout');

        console.log('Preenchendo informações de endereço...');
        await page.waitForSelector('input[name="street[0]"]');
        await page.type('input[name="street[0]"]', 'Alaor da silveira');
        await page.waitForSelector('input[name="city"]');
        await page.type('input[name="city"]', 'Palhoça');
        await page.select('select[name="country_id"]', 'BR');
        await page.select('select[name="region_id"]', '507');
        await page.type('input[name="postcode"]', '88136-240');
        await page.type('input[name="telephone"]', '48988271966');

        await waitfor(2000);

        console.log('Selecionando método de envio...');
        await page.waitForSelector('input[type="radio"][value="flatrate_flatrate"]');
        await page.click('input[type="radio"][value="flatrate_flatrate"]');

        await waitfor(2000);

        console.log('Continuando para o próximo passo...');
        await page.waitForSelector('button.action.continue.primary');
        await page.click('button.action.continue.primary');

        await waitfor(2000);

        console.log('Finalizando o checkout...');
        await page.waitForSelector('button.action.primary.checkout');
        await page.click('button.action.primary.checkout');

        console.log('Test concluído com sucesso. Fechando navegador...');
        await browser.close();
    } catch (error) {
        console.error('Erro durante o teste:', error);
    }
})();