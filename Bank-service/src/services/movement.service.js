export async function withdraw(data, userId) {
    const session = await mongoose.startSession();
    session.startTransaction(); 

    try {
        if (data.amount <= 0) throw new Error('El monto debe ser mayor a 0');

        
        if (data.idempotencyKey) {
            const existingMovement = await Movement.findOne({ idempotencyKey: data.idempotencyKey }).session(session);
            if (existingMovement) return existingMovement;
        }

        const account = await Account.findById(data.accountId).session(session);

        
        if (!account) throw new Error('Cuenta no encontrada');
       
        if (account.estado !== 'activa') throw new Error('Cuenta inactiva');

        
        if (account.saldo < data.amount) {
            throw new Error('Saldo insuficiente para realizar el retiro');
        }

        
        account.saldo -= data.amount;
        await account.save({ session });

            
        const movement = await Movement.create([{
            accountId: data.accountId,
            movementType: 'WITHDRAW',   
            amount: data.amount,
            channel: data.channel || 'ATM',
            executedBy: userId,
            status: 'COMPLETED',
            idempotencyKey: data.idempotencyKey || undefined,
            description: data.description || 'Retiro de efectivo'
        }], { session });

        await session.commitTransaction();  
        session.endSession();
        return movement[0];

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}