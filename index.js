const express = require('express')

const db = require('./database')
console.log('Database export:', db);
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API');
});


app.get('/transactions', (req, res) => {
  const { type, category, startDate, endDate } = req.query;

  // Validate type
  if (
    type !== undefined &&
    type !== 'income' &&
    type !== 'expense'
  ) {
    return res.status(400).json({
      message: 'Invalid type. Use income or expense.'
    });
  }

  // Validate category
  if (
    category !== undefined &&
    (typeof category !== 'string' || category.trim() === '')
  ) {
    return res.status(400).json({
      message: 'Category must not be empty.'
    });
  }

  // Validate date format and real calendar dates
  const isValidDate = (date) => {
    if (typeof date !== 'string') return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);

    return !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date;
  };

  if (
    startDate !== undefined &&
    !isValidDate(startDate)
  ) {
    return res.status(400).json({
      message: 'Invalid startDate. Use YYYY-MM-DD.'
    });
  }

  if (
    endDate !== undefined &&
    !isValidDate(endDate)
  ) {
    return res.status(400).json({
      message: 'Invalid endDate. Use YYYY-MM-DD.'
    });
  }

  // Start date must not be later than end date
  if (
    startDate !== undefined &&
    endDate !== undefined &&
    startDate > endDate
  ) {
    return res.status(400).json({
      message: 'startDate must not be later than endDate.'
    });
  }

  // Build the SQL query dynamically
  let sql = 'SELECT * FROM transactions';

  const conditions = [];
  const values = [];

  if (type !== undefined) {
    conditions.push('type = ?');
    values.push(type);
  }

  if (category !== undefined) {
    conditions.push('category = ?');
    values.push(category.trim());
  }

  if (startDate !== undefined) {
    conditions.push('transaction_date >= ?');
    values.push(startDate);
  }

  if (endDate !== undefined) {
    conditions.push('transaction_date <= ?');
    values.push(endDate);
  }

  // Add WHERE only if filters exist
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Execute the query
  const transactions = db.prepare(sql).all(...values);

  return res.status(200).json(transactions);
});


app.get('/transactions/summary', (req, res) => {
  const { startDate, endDate } = req.query;

  const isValidDate = (date) => {
    if (typeof date !== 'string') return false;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }

    const parsed = new Date(`${date}T00:00:00.000Z`);

    return !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date;
  };

  if (startDate !== undefined && !isValidDate(startDate)) {
    return res.status(400).json({
      message: 'Invalid startDate. Use YYYY-MM-DD.'
    });
  }

  if (endDate !== undefined && !isValidDate(endDate)) {
    return res.status(400).json({
      message: 'Invalid endDate. Use YYYY-MM-DD.'
    });
  }

  if (
    startDate !== undefined &&
    endDate !== undefined &&
    startDate > endDate
  ) {
    return res.status(400).json({
      message: 'startDate must not be later than endDate.'
    });
  }

  let sql = `
    SELECT
      COALESCE(SUM(
        CASE WHEN type = 'income' THEN amount ELSE 0 END
      ), 0) AS totalIncome,

      COALESCE(SUM(
        CASE WHEN type = 'expense' THEN amount ELSE 0 END
      ), 0) AS totalExpenses,

      COALESCE(SUM(
        CASE
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
          ELSE 0
        END
      ), 0) AS balance,

      COUNT(*) AS transactionCount

    FROM transactions
  `;

  const conditions = [];
  const values = [];

  if (startDate !== undefined) {
    conditions.push('transaction_date >= ?');
    values.push(startDate);
  }

  if (endDate !== undefined) {
    conditions.push('transaction_date <= ?');
    values.push(endDate);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  const summary = db.prepare(sql).get(...values);

  return res.status(200).json(summary);
});


app.get('/transactions/:id', (req, res) => {
  const transactionId = Number(req.params.id);

  if (!Number.isInteger(transactionId) || transactionId <= 0) {
    return res.status(400).json({
      message: 'Invalid Transaction id'
    })
  }
  const transactions = db.prepare(`
    SELECT * FROM transactions 
    WHERE id=?`).get(transactionId)

  if (!transactions) {
    return res.status(404).json({ message: 'Transaction not found' });
  }
  res.json(transactions);
});


app.post('/transactions', (req, res) => {
  const { description, amount, type, category, transaction_date } = req.body;

  if (typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({
      message: 'Transaction Description is required'
    })
  }


  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({
      message: 'Transaction amount is not valid'
    })
  }


  if (typeof type !== 'string' || type.trim() === '') {
    return res.status(400).json({
      message: 'transaction type is required'
    })
  }


  if (typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({
      message: 'Transaction category is required'
    })
  }


  if (typeof transaction_date !== 'string' || transaction_date.trim() === '') {
    return res.status(400).json({
      message: 'transaction date is required'
    })
  }



  const result = db.prepare(`INSERT INTO transactions
    (
    description,
     amount,
      type, 
      category, 
      transaction_date
      ) 
      VALUES 
      (?, ?, ?,?,?)`
  ).run(description.trim(), amount, type, category.trim(), transaction_date)

  const newTransaction = db.prepare(`SELECT * FROM transactions
     WHERE  id=?`
  ).get(Number(result.lastInsertRowid))

  return res.status(201).json({
    message: 'transaction  added successfully',
    product: newTransaction
  })
})



app.put('/transactions/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'invalid product ID'
    })
  }
  // 1. Find the existing product

  // 2. Read all required fields
  const { description, amount, type, category, transaction_date } = req.body;

  // 3. Validate name

  if (typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({
      message: 'Transaction Description is required'
    })
  }


  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    return res.status(400).json({
      message: 'Transaction amount is not valid'
    })
  }


  if (typeof type !== 'string' || type.trim() === '') {
    return res.status(400).json({
      message: 'transaction type is required'
    })
  }


  if (typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({
      message: 'Transaction category is required'
    })
  }


  if (typeof transaction_date !== 'string' || transaction_date.trim() === '') {
    return res.status(400).json({
      message: 'transaction date is required'
    })
  }

  const result = db.prepare(`UPDATE transactions
    SET description=?,
     amount=?,
      type=? ,
      category=?,
      transaction_date=?
      WHERE id=?`
  ).run(description.trim(), amount, type, category.trim(), transaction_date, id)



  if (result.changes === 0) {
    return res.status(404).json({
      message: 'Product not found'
    });
  }

  const newTransaction = db.prepare(`SELECT * FROM transactions
     WHERE  id=?`
  ).get(id)

  return res.status(201).json({
    message: 'transaction  added successfully',
    product: newTransaction
  })
});



app.patch("/transactions/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'Invalid product ID'
    })
  }
  const transact = db.prepare(`SELECT * FROM transactions
     WHERE ID=?`).get(id)
  if (!transact) {
    return res.status(404).json({
      message: "Transaction  not found"
    });
  }
  // 2. Read all required fields
  const { description, amount, type, category, transaction_date } = req.body;

  if (
    description === undefined &&
    amount === undefined &&
    type === undefined &&
    category === undefined &&
    transaction_date === undefined
  ) {
    return res.status(400).json({
      message: "Provide at least one field to update"
    });
  }
  // 3. Validate name
  if (description !== undefined) {

    if (typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({
        message: 'Transaction Description is required'
      })
    }
  }

  if (amount !== undefined) {
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        message: 'Transaction amount is not valid'
      })
    }
  }

  if (type !== undefined) {

    if (typeof type !== 'string' || type.trim() === '') {
      return res.status(400).json({
        message: 'transaction type is required'
      })
    }


  }

  if (category !== undefined) {

    if (typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({
        message: 'Transaction category is required'
      })
    }
  }

  if (transaction_date !== undefined) {

    if (typeof transaction_date !== 'string' || transaction_date.trim() === '') {
      return res.status(400).json({
        message: 'transaction date is required'
      })
    }
  }

  // 7. Update only the fields provided

  let updates = []
  let values = []
  if (description !== undefined) {
    updates.push('description=?')
    values.push(description.trim())
  }

  if (amount !== undefined) {
    updates.push('amount=?')
    values.push(amount)
  }

  if (type !== undefined) {
    updates.push('type=?')
    values.push(type)
  }


  if (category !== undefined) {
    updates.push('category=?')
    values.push(category)
  }


  if (transaction_date !== undefined) {
    updates.push('transaction_date=?')
    values.push(transaction_date)
  }

  values.push(id)

  db.prepare(`
  UPDATE transactions SET ${updates.join(', ')}
  WHERE id=?`).run(...values);


  // 8. Return the updated product
  const transaction = db.prepare(`
    SELECT * FROM transactions WHERE id=?
    `).run(id)

  return res.status(200).json({
    message: "Product updated successfully",
    product: transaction
  });
});


app.delete('/transactions/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'Invalid product ID'
    })
  }

  // 1. Find the product's position in the array
  const transaction = db.prepare(`SELECT * FROM transactions 
  WHERE id=?`).get(id)
  // 2. Check whether the product exists
  if (!transaction) {
    return res.status(404).json({
      message: 'transaction not found'
    });
  }

  // 3. Remove one product from the array
  db.prepare(` DELETE FROM transactions
  WHERE id=?`).run(id)
  // 4. Confirm deletion
  return res.status(200).json({
    message: 'Product deleted successfully',
    product: transaction
  });
});


app.listen(3000, () => {
  console.log('Expense Tracker API is running on port 3000');
});

