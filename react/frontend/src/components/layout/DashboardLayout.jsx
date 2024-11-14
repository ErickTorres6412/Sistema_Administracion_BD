import React, { useState } from 'react';
import { Container, Navbar, NavbarBrand, Nav, NavItem, Button } from 'reactstrap';
import { FiDatabase, FiHardDrive, FiSettings, FiActivity, FiSearch, FiShield, FiMenu, FiX } from 'react-icons/fi';
import BackupManager from '../../components/backup/BackupManager';
import SecurityManager from '../../components/security/SecurityManager';
import TablespaceManager from '../../components/tablespace/TablespaceManager';
import TuningManager from '../tuning/TuningManager';
import AuditManager from '../audit/AuditManager';
import PerformanceManager from '../performance/PerformanceManager';


const DashboardLayout = () => {
    const [activeSection, setActiveSection] = useState('backup');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const menuItems = [
        { id: 'backup', icon: <FiDatabase />, label: 'Respaldos' },
        { id: 'tablespaces', icon: <FiHardDrive />, label: 'Tablespaces' },
        { id: 'tuning', icon: <FiSettings />, label: 'Tuning' },
        { id: 'performance', icon: <FiActivity />, label: 'Performance' },
        { id: 'audit', icon: <FiSearch />, label: 'Auditoría' },
        { id: 'security', icon: <FiShield />, label: 'Seguridad' }
    ];

    const sidebarWidth = sidebarCollapsed ? '64px' : '250px';

    return (
        <div className="d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <div 
                className="bg-dark text-white shadow-lg" 
                style={{ 
                    width: sidebarWidth, 
                    position: 'fixed', 
                    height: '100vh',
                    transition: 'width 0.3s ease',
                    zIndex: 1000
                }}
            >
                <Navbar dark className="p-3 d-flex justify-content-between align-items-center">
                    {!sidebarCollapsed && <NavbarBrand href="/" className="me-0">DB Admin</NavbarBrand>}
                    <Button
                        color="dark"
                        size="sm"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-1"
                    >
                        {sidebarCollapsed ? <FiMenu /> : <FiX />}
                    </Button>
                </Navbar>
                <Nav vertical className="p-2">
                    {menuItems.map((item) => (
                        <NavItem key={item.id} className="mb-2">
                            <Button
                                color={activeSection === item.id ? "primary" : "dark"}
                                className={`w-100 text-start d-flex align-items-center ${sidebarCollapsed ? 'justify-content-center p-2' : ''}`}
                                onClick={() => setActiveSection(item.id)}
                                title={sidebarCollapsed ? item.label : ''}
                            >
                                <span className={sidebarCollapsed ? '' : 'me-2'}>{item.icon}</span>
                                {!sidebarCollapsed && item.label}
                            </Button>
                        </NavItem>
                    ))}
                </Nav>
            </div>

            {/* Main Content */}
            <div style={{ 
                marginLeft: sidebarWidth, 
                width: `calc(100% - ${sidebarWidth})`,
                transition: 'margin-left 0.3s ease, width 0.3s ease'
            }}>
                <Container fluid className="p-4">
                    {activeSection === 'backup' && <BackupManager />}
                    {activeSection === 'security' && <SecurityManager />}
                    {activeSection === 'tablespaces' && <TablespaceManager />}
                    {activeSection === 'tuning' && <TuningManager />}
                    {activeSection === 'audit' && <AuditManager />}
                    {activeSection === 'performance' && <PerformanceManager />}

                    {/* Aquí puedes agregar los demás componentes para las otras secciones */}
                </Container>
            </div>
        </div>
    );
};

export default DashboardLayout;