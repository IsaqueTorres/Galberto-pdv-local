import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import Vendas from "./pages/sales/SalesMainPage";
import ProductsMainPage from "./pages/products/ProductsMainPage"
import Config from "./pages/config/ConfigMainPage";
import PdvRapido from "./pages/POS/PdvRapido";
import SearchProduct from "./pages/products/SearchProducts";
import ConfigUsuarios from "./pages/config/ConfigUsuarios"
import ConfigPrinters from "./pages/config/ConfigPrinters"
import UsuarioView from "./pages/config/UsuarioView";
import CadastrarUsuarios from "./pages/config/CadastrarUsuarios";
import EditUser from "./pages/config/EditUser";

export default function App() {
  return (

    <HashRouter>

      <Routes>
        <Route path="/" element={<Login />} />


        <Route path="/config" element={<Config />} />
        <Route path="/pdv" element={<PdvRapido />} />

        {/* ROTAS DA PAGINA PRODUTOS */}
        <Route path="/products" element={<ProductsMainPage />} />
        <Route path="/products/search" element={<SearchProduct />} />


        {/* ROTAS DA PAGINA  VENDAS*/}
        <Route path="/sales/search" element={<Vendas />} /> {/*Validado 23/03/2026 - CRIA PAGINA PESQUISAR VENDAS EM PDV RAPIDO, MENU F2 */}
        <Route path="/vendas" element={<Vendas />} />



        {/* ROTAS DA PAGINA USUARIOS */}
        <Route path="/config/perfil/" element={<ConfigUsuarios />} />
        <Route path="/config/app" element={<Config />} /> {/*Validado 31/03/2026 - CRIA PAGINA PESQUISAR CONFIG EM PDV RAPIDO, MENU F2 */}
        <Route path="/config/printers/" element={<ConfigPrinters />} />
        <Route path="/config/usuarios/:id" element={<UsuarioView />} />
        <Route path="/config/usuarios/cadastrar_usuario" element={<CadastrarUsuarios />} />
        <Route path="/config/users/edit_user/:id" element={<EditUser />} />

      </Routes>

    </HashRouter>


  );
}
