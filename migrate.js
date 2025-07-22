import sequelize from './config/database.js';
import User from './models/User.js';
import Asset from './models/Asset.js';

async function migrate() {
    try {
        console.log('🔄 Testando conexão com PostgreSQL...');
        await sequelize.authenticate();
        console.log('✅ Conexão estabelecida com sucesso!');

        console.log('🔄 Sincronizando modelos...');
        // alter: true vai atualizar as tabelas se necessário
        await sequelize.sync({ force: false, alter: true });
        console.log('✅ Tabelas criadas/atualizadas com sucesso!');

        // Verificar se as tabelas foram criadas
        console.log('🔄 Verificando tabelas criadas...');
        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('📋 Tabelas no banco:', tables);

        console.log('🎉 Migração concluída com sucesso!');

    } catch (error) {
        console.error('❌ Erro na migração:');
        console.error('Detalhes:', error.message);

        if (error.name === 'ConnectionError') {
            console.error('💡 Verifique se:');
            console.error('   - PostgreSQL está rodando');
            console.error('   - Credenciais no .env estão corretas');
            console.error('   - O banco foi criado no pgAdmin');
        }
    } finally {
        await sequelize.close();
        console.log('🔌 Conexão fechada');
    }
}

migrate();