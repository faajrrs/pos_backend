const { nanoid } = require("nanoid"); // Install dulu: npm install nanoid
const db = require("./Config"); // <-- Import the database connection pool
// let { categories, products, keranjangs, pesanans } = require("./MockData");

const routes = [
  // 1. Mengambil semua Kategori from database
  {
    method: "GET",
    path: "/categories",
    handler: async (request, h) => {
      try {
        const [rows] = await db.query("SELECT * FROM categories");
        return h.response(rows);
      } catch (error) {
        console.error(error);
        return h.response({ message: "Internal Server Error" }).code(500);
      }
    },
  },

  // 2. Mengambil Produk from database (with filters)
  {
    method: "GET",
    path: "/products",
    handler: async (request, h) => {
      const { "category.nama": categoryName, q: searchQuery } = request.query;

      let query = `
                SELECT p.*, c.nama as category_nama 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE 1=1
            `;
      const queryParams = [];

      if (categoryName) {
        query += " AND c.nama = ?";
        queryParams.push(categoryName);
      }

      if (searchQuery) {
        query += " AND p.nama LIKE ?";
        queryParams.push(`%${searchQuery}%`);
      }

      try {
        const [rows] = await db.query(query, queryParams);
        // We need to format the data to match what the frontend expects
        const formattedRows = rows.map((row) => ({
          id: row.id,
          kode: row.kode,
          nama: row.nama,
          harga: row.harga,
          is_ready: row.is_ready,
          gambar: row.gambar,
          category: {
            id: row.category_id,
            nama: row.category_nama,
          },
        }));
        return h.response(formattedRows);
      } catch (error) {
        console.error(error);
        return h.response({ message: "Internal Server Error" }).code(500);
      }
    },
  },

  // 3. Mengambil semua item di Keranjang from database (DENGAN ANTI-CACHE)
  {
    method: "GET",
    path: "/keranjangs",
    handler: async (request, h) => {
      try {
        const SQL_QUERY = `
    SELECT 
        k.id AS keranjang_id, 
        k.jumlah, 
        k.keterangan, 
        p.id AS product_id, 
        p.kode,             -- Tambahkan ini
        p.nama AS product_nama, 
        p.harga, 
        p.gambar, 
        p.category_id,      -- Tambahkan ini
        c.nama AS category_nama
    FROM keranjangs k
    JOIN products p ON k.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    `.trim();

        const [rows] = await db.query(SQL_QUERY);

        const formattedKeranjangs = rows.map((row) => ({
          id: row.keranjang_id,
          jumlah: row.jumlah,
          keterangan: row.keterangan,
          total_harga: row.jumlah * row.harga,
          product: {
            id: row.product_id,
            nama: row.product_nama,
            harga: row.harga,
            gambar: row.gambar,
            category: {
              nama: row.category_nama,
            },
          },
        }));

        return h
          .response(formattedKeranjangs)
          .header("Cache-Control", "no-cache, no-store, must-revalidate")
          .header("Pragma", "no-cache")
          .header("Expires", "0")
          .code(200);
      } catch (error) {
        console.error(error);
        return h.response({ message: "Internal Server Error" }).code(500);
      }
    },
  },

  // 4. Menambah item ke Keranjang in database (LOGIKA UPSERT BARU)
  {
    method: "POST",
    path: "/keranjangs",
    handler: async (request, h) => {
      const { jumlah, product, keterangan } = request.payload;
      const product_id = product.id; // Ambil product ID

      try {
        // 1. CEK: Cari apakah produk sudah ada di keranjang
        const [existingKeranjang] = await db.query(
          "SELECT id, jumlah FROM keranjangs WHERE product_id = ?",
          [product_id]
        );

        if (existingKeranjang.length > 0) {
          // JIKA ADA (UPDATE)
          const itemLama = existingKeranjang[0];
          const newJumlah = itemLama.jumlah + jumlah; // Tambahkan jumlah yang baru // UPDATE JUMLAH DAN KETERANGAN

          const updateQuery =
            "UPDATE keranjangs SET jumlah = ?, keterangan = ? WHERE id = ?";
          await db.query(updateQuery, [newJumlah, keterangan, itemLama.id]);

          return h
            .response({
              message: "Jumlah keranjang berhasil diupdate",
              id: itemLama.id,
              newJumlah,
            })
            .code(200);
        } else {
          // JIKA TIDAK ADA (INSERT BARU)
          const id = nanoid(16);
          await db.query(
            "INSERT INTO keranjangs (id, jumlah, keterangan, product_id) VALUES (?, ?, ?, ?)",
            [id, jumlah, keterangan, product_id]
          );
          return h
            .response({
              message: "Item baru ditambahkan",
              id,
              ...request.payload,
            })
            .code(201);
        }
      } catch (error) {
        console.error(error);
        return h.response({ message: "Internal Server Error" }).code(500);
      }
    },
  },

  // 5. MENGUPDATE item di Keranjang (JUMLAH & KETERANGAN)
//   {
//     method: ["PUT", "PATCH"],
//     path: "/keranjangs/{id}",
//     handler: async (request, h) => {
//       const { id } = request.params;
//       const { jumlah, keterangan } = request.payload;

//       if (typeof jumlah !== "number" || jumlah < 1) {
//         return h.response({ message: "Jumlah harus angka positif." }).code(400);
//       }

//       try {
//         const [keranjangRows] = await db.query(
//           "SELECT product_id FROM keranjangs WHERE id = ?",
//           [id]
//         );

//         if (keranjangRows.length === 0) {
//           return h
//             .response({ message: "Item keranjang tidak ditemukan" })
//             .code(404);
//         }

//         const productId = keranjangRows[0].product_id;
//         const [productRows] = await db.query(
//           "SELECT harga FROM products WHERE id = ?",
//           [productId]
//         );

//         if (productRows.length === 0) {
//           return h
//             .response({ message: "Produk terkait tidak ditemukan" })
//             .code(404);
//         }

//         const harga = productRows[0].harga;
//         const total_harga = jumlah * harga;

//         const [result] = await db.query(
//           `UPDATE keranjangs SET jumlah = ?, keterangan = ?, total_harga = ? WHERE id = ?`,
//           [jumlah, keterangan || null, total_harga, id]
//         );

//         if (result.affectedRows === 0) {
//           return h
//             .response({
//               message: "Tidak ada perubahan atau item tidak ditemukan",
//             })
//             .code(200);
//         }

//         return h
//           .response({ message: "Item berhasil diperbarui", total_harga })
//           .code(200);
//       } catch (error) {
//         console.error(
//           "Error Update Keranjang (Route 8):",
//           error.message || error
//         );
//         return h
//           .response({ message: "Internal Server Error saat update keranjang" })
//           .code(500);
//       }
//     },
//   },
    {
      method: "PUT",
      path: "/keranjangs/{id}",
      handler: async (request, h) => {
        const { id } = request.params;
        const { jumlah, keterangan } = request.payload;

        try {
          const query =
            "UPDATE keranjangs SET jumlah = ?, keterangan = ? WHERE id = ?";
          await db.query(query, [jumlah, keterangan, id]);

          return h
            .response({
              message: "Keranjang berhasil diperbarui",
            })
            .code(200);
        } catch (error) {
          console.error(error);
          return h.response({ message: "Internal Server Error" }).code(500);
        }
      },
    },

  // 6. MENGHAPUS item dari Keranjang (DENGAN KODE STATUS HAPUS YANG TEPAT)
  {
    method: "DELETE",
    path: "/keranjangs/{id}",
    handler: async (request, h) => {
      const { id } = request.params;

      try {
        const [result] = await db.query("DELETE FROM keranjangs WHERE id = ?", [
          id,
        ]);

        if (result.affectedRows === 0) {
          return h.response({ message: "Item tidak ditemukan" }).code(404);
        }

        return h.response({ message: "Item berhasil dihapus" }).code(200);
      } catch (error) {
        console.error(error);
        return h.response({ message: "Internal Server Error" }).code(500);
      }
    },
  },

  // 7. CHECKOUT (Membuat Pesanan Baru)
  {
    method: "POST",
    path: "/pesanans",
    handler: async (request, h) => {
      const { total_bayar } = request.payload;
      const id = nanoid(16);
      const tanggal = new Date();

      if (!total_bayar || isNaN(total_bayar) || total_bayar <= 0) {
        return h
          .response({
            message: "Gagal Checkout: total_bayar tidak valid atau kosong.",
          })
          .code(400);
      }

      try {
        await db.query(
          "INSERT INTO pesanans (id, total_bayar, tanggal) VALUES (?, ?, ?)",
          [id, total_bayar, tanggal]
        );

        await db.query("DELETE FROM keranjangs");

        return h
          .response({
            message: "Pesanan berhasil dibuat",
          })
          .code(201);
      } catch (error) {
        console.error("Database Error:", error);
        return h
          .response({ message: "Internal Server Error (Database)" })
          .code(500);
      }
    },
  },
];

module.exports = routes;

// const routes = [
//         {
//         method: 'GET',
//         path: '/',
//         handler: (request, h) => {

//             return 'Halaman Home';
//         },
//     },

//     {
//         method: 'GET',
//         path: '/about',
//         handler: (require, h) => {

//             return 'Halaman About';
//         },
//     },

//     {
//         method: 'GET',
//         path: '/user/{name?}',
//         handler: (require, h) => {
//             const { name = "Fajar Satria Sebastian" } = require.params;
//             const { from } = require.query;

//             if ( from === "Indonesia" ) return `Hallo nama saya ${name} dari ${from}`;

//             return `Hallo nama saya ${name}`;
//         },
//     },

//     {
//         method: '*',
//         path: '/about',
//         handler: (require, h) => {

//             return 'Halaman ini tidak bisa di akses dengan method!';
//         },
//     },

//     {
//         method: 'GET',
//         path: '/{any*}',
//         handler: (require, h) => {

//             return 'Halaman Ini Ditemukan!';
//         },
//     },
//     ]

// module.exports = routes;
