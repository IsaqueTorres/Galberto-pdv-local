import { HashRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import Vendas from "./pages/sales/SalesMainPage";
import ProductsMainPage from "./pages/products/ProductsMainPage"
import Config from "./pages/config/ConfigMainPage";
import PdvRapido from "./pages/POS/PdvRapido";
import SearchProduct from "./pages/products/SearchProducts";
import ProdutoView from "./pages/products/ProdutoView";
import ConfigUsuarios from "./pages/config/ConfigUsuarios"
import ConfigPrinters from "./pages/config/ConfigPrinters"
import UsuarioView from "./pages/config/UsuarioView";
import CadastrarUsuarios from "./pages/config/CadastrarUsuarios";
import EditUser from "./pages/config/EditUser";
import { RequirePermission } from "./components/RequirePermission";
import Home from "./pages/Home";
import Base from "./pages/Base";

export default function App() {
  return (

    <HashRouter>

      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/pdv" element={<RequirePermission anyOf={["pdv:access"]}><PdvRapido /></RequirePermission>} />

        <Route element={<RequirePermission anyOf={["home:access"]}><Base /></RequirePermission>}>
          <Route path="/home" element={<Home />} />
          <Route path="/config" element={<RequirePermission anyOf={["config:access"]}><Config /></RequirePermission>} />
          <Route path="/config/app" element={<RequirePermission anyOf={["config:access"]}><Config /></RequirePermission>} />
          <Route path="/products" element={<RequirePermission anyOf={["products:manage"]}><ProductsMainPage /></RequirePermission>} />
          <Route path="/vendas" element={<RequirePermission anyOf={["sales:view"]}><Vendas /></RequirePermission>} />
        </Route>

        {/* ROTAS STANDALONE USADAS PELO PDV RAPIDO */}
        <Route path="/pdv/config/app" element={<RequirePermission anyOf={["config:access"]}><Config /></RequirePermission>} />
        <Route path="/pdv/products/search" element={<RequirePermission anyOf={["products:view"]}><SearchProduct /></RequirePermission>} />

        {/* ROTAS DA PAGINA PRODUTOS */}
        <Route path="/products/search" element={<RequirePermission anyOf={["products:view"]}><SearchProduct /></RequirePermission>} />
        <Route path="/products/:id" element={<RequirePermission anyOf={["products:view"]}><ProdutoView /></RequirePermission>} />


        {/* ROTAS DA PAGINA  VENDAS*/}
        <Route path="/sales/search" element={<RequirePermission anyOf={["sales:view"]}><Vendas /></RequirePermission>} /> {/*Validado 23/03/2026 - CRIA PAGINA PESQUISAR VENDAS EM PDV RAPIDO, MENU F2 */}



        {/* ROTAS DA PAGINA USUARIOS */}
        <Route path="/config/perfil/" element={<RequirePermission anyOf={["users:manage"]}><ConfigUsuarios /></RequirePermission>} />
        <Route path="/config/printers/" element={<RequirePermission anyOf={["printers:manage"]}><ConfigPrinters /></RequirePermission>} />
        <Route path="/config/usuarios/:id" element={<RequirePermission anyOf={["users:manage"]}><UsuarioView /></RequirePermission>} />
        <Route path="/config/usuarios/cadastrar_usuario" element={<RequirePermission anyOf={["users:manage"]}><CadastrarUsuarios /></RequirePermission>} />
        <Route path="/config/users/edit_user/:id" element={<RequirePermission anyOf={["users:manage"]}><EditUser /></RequirePermission>} />

      </Routes>

    </HashRouter>


  );
}
