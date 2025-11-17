 

const getPlatosByPedido = async (idPedido) => {
};

const getPedidos = async () => {
};

const getPedidoById = async (id) => {

};

const getPedidosByUser = async (idUsuario) => {
 
};

const createPedido = async (idUsuario, platos) => {
 
        // ACÁ SE PODRÍA HACER EN ETAPAS
        // 1. Validar que los platos existan
        // 2. Crear el pedido
        // 3. Agregar los platos al pedido

        // Así, no hace falta introducir el concepto de transacciones o rollback
 
};

const updatePedido = async (id, estado) => {
 
};

const deletePedido = async (id) => {
 
};

export default {
    getPlatosByPedido,
    getPedidos,
    getPedidoById,
    getPedidosByUser,
    createPedido,
    updatePedido,
    deletePedido,
};
